import uuid
import json
import logging
from datetime import datetime

from typing import List, Dict, Any, Optional
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent import AgentManager
from app.prompt import prompt_factory
from app.schemas.json import json_schema_factory
from app.models import Job, Resume, ProcessedJob
from app.schemas.pydantic import StructuredJobModel
from .exceptions import JobNotFoundError

logger = logging.getLogger(__name__)


class JobService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.json_agent_manager = AgentManager(model="gemma3:4b")

    async def create_and_store_job(self, job_data: dict) -> List[str]:
        """
        Stores job data in the database and returns a list of job IDs.
        """
        resume_id = str(job_data.get("resume_id"))

        if not await self._is_resume_available(resume_id):
            raise AssertionError(
                f"resume corresponding to resume_id: {resume_id} not found"
            )

        job_ids = []
        for job_description in job_data.get("job_descriptions", []):
            job_id = str(uuid.uuid4())
            job = Job(
                job_id=job_id,
                resume_id=str(resume_id),
                content=job_description,
            )
            self.db.add(job)

            await self._extract_and_store_structured_job(
                job_id=job_id, job_description_text=job_description
            )
            logger.info(f"Job ID: {job_id}")
            job_ids.append(job_id)

        await self.db.commit()
        return job_ids

    async def _is_resume_available(self, resume_id: str) -> bool:
        """
        Checks if a resume exists in the database.
        """
        query = select(Resume).where(Resume.resume_id == resume_id)
        result = await self.db.scalar(query)
        return result is not None

    async def _extract_and_store_structured_job(
        self, job_id, job_description_text: str
    ):
        """
        extract and store structured job data in the database
        """
        structured_job = await self._extract_structured_json(job_description_text)
        
        if not structured_job:
            logger.warning("Structured job extraction failed. Creating fallback record.")
            # Create a basic fallback record to prevent downstream failures
            fallback_job = self._create_fallback_job_data(job_description_text)
            structured_job = fallback_job

        try:
            processed_job = ProcessedJob(
                job_id=job_id,
                job_title=structured_job.get("job_title"),
                company_profile=json.dumps(structured_job.get("company_profile"))
                if structured_job.get("company_profile")
                else None,
                location=json.dumps(structured_job.get("location"))
                if structured_job.get("location")
                else None,
                date_posted=structured_job.get("date_posted"),
                employment_type=structured_job.get("employment_type"),
                job_summary=structured_job.get("job_summary"),
                key_responsibilities=json.dumps(
                    {"key_responsibilities": structured_job.get("key_responsibilities", [])}
                )
                if structured_job.get("key_responsibilities")
                else None,
                qualifications=json.dumps(structured_job.get("qualifications", []))
                if structured_job.get("qualifications")
                else None,
                compensation_and_benfits=json.dumps(
                    structured_job.get("compensation_and_benefits", [])
                )
                if structured_job.get("compensation_and_benefits")
                else None,
                application_info=json.dumps(structured_job.get("application_info", []))
                if structured_job.get("application_info")
                else None,
                extracted_keywords=json.dumps(
                    {"extracted_keywords": structured_job.get("extracted_keywords", [])}
                )
                if structured_job.get("extracted_keywords")
                else None
            )

            self.db.add(processed_job)
            await self.db.flush()
            await self.db.commit()
            logger.info(f"Successfully stored processed job {job_id}")
            return job_id
            
        except Exception as e:
            logger.error(f"Failed to store processed job {job_id}: {str(e)}")
            # Even if storage fails, we should still commit the base job record
            await self.db.commit()
            raise

    def _create_fallback_job_data(self, job_description_text: str) -> Dict[str, Any]:
        """
        Create a minimal job data structure when AI extraction fails
        """
        # Try to extract basic information using simple text processing
        lines = job_description_text.split('\n')
        first_line = next((line.strip() for line in lines if line.strip()), "Untitled Position")
        
        # Simple keyword extraction
        keywords = []
        common_keywords = [
            'python', 'javascript', 'java', 'react', 'node', 'sql', 'aws', 'docker',
            'kubernetes', 'git', 'linux', 'api', 'database', 'frontend', 'backend',
            'full-stack', 'machine learning', 'ai', 'data', 'analytics', 'cloud'
        ]
        text_lower = job_description_text.lower()
        for keyword in common_keywords:
            if keyword in text_lower:
                keywords.append(keyword)
        
        return {
            "job_title": first_line[:100],  # Truncate to reasonable length
            "company_profile": {
                "companyName": "Unknown Company",
                "industry": None,
                "website": None,
                "description": None
            },
            "location": {
                "city": None,
                "state": None,
                "country": None,
                "remoteStatus": "Not Specified"
            },
            "date_posted": datetime.now().strftime("%Y-%m-%d"),
            "employment_type": "Not Specified",
            "job_summary": job_description_text[:500] + "..." if len(job_description_text) > 500 else job_description_text,
            "key_responsibilities": [],
            "qualifications": {
                "required": [],
                "preferred": []
            },
            "compensation_and_benefits": {
                "salaryRange": None,
                "benefits": []
            },
            "application_info": {
                "howToApply": None,
                "applyLink": None,
                "contactEmail": None
            },
            "extracted_keywords": keywords
        }

    async def _extract_structured_json(
        self, job_description_text: str
    ) -> Dict[str, Any] | None:
        """
        Uses the AgentManager+JSONWrapper to ask the LLM to
        return the data in exact JSON schema we need.
        """
        prompt_template = prompt_factory.get("structured_job")
        prompt = prompt_template.format(
            json.dumps(json_schema_factory.get("structured_job"), indent=2),
            job_description_text,
        )
        logger.info(f"Structured Job Prompt: {prompt}")
        
        try:
            raw_output = await self.json_agent_manager.run(prompt=prompt)
            logger.info(f"LLM Raw Output: {raw_output}")
            
            # Validate the raw output
            structured_job: StructuredJobModel = StructuredJobModel.model_validate(
                raw_output
            )
            logger.info("Job validation successful")
            return structured_job.model_dump(mode="json")
            
        except ValidationError as e:
            logger.error(f"Pydantic validation failed for job: {e}")
            logger.error(f"Raw LLM output that failed validation: {raw_output}")
            
            # Log detailed error information
            for error in e.errors():
                field = " -> ".join(str(loc) for loc in error["loc"])
                logger.error(f"Validation error in field '{field}': {error['msg']}")
                
            return None
        except Exception as e:
            logger.error(f"Unexpected error in job extraction: {str(e)}")
            return None

    async def get_job_with_processed_data(self, job_id: str) -> Optional[Dict]:
        """
        Fetches both job and processed job data from the database and combines them.

        Args:
            job_id: The ID of the job to retrieve

        Returns:
            Combined data from both job and processed_job models

        Raises:
            JobNotFoundError: If the job is not found
        """
        job_query = select(Job).where(Job.job_id == job_id)
        job_result = await self.db.execute(job_query)
        job = job_result.scalars().first()

        if not job:
            raise JobNotFoundError(job_id=job_id)

        processed_query = select(ProcessedJob).where(ProcessedJob.job_id == job_id)
        processed_result = await self.db.execute(processed_query)
        processed_job = processed_result.scalars().first()

        combined_data = {
            "job_id": job.job_id,
            "raw_job": {
                "id": job.id,
                "resume_id": job.resume_id,
                "content": job.content,
                "created_at": job.created_at.isoformat() if job.created_at else None,
            },
            "processed_job": None
        }

        if processed_job:
            combined_data["processed_job"] = {
                "job_title": processed_job.job_title,
                "company_profile": json.loads(processed_job.company_profile) if processed_job.company_profile else None,
                "location": json.loads(processed_job.location) if processed_job.location else None,
                "date_posted": processed_job.date_posted,
                "employment_type": processed_job.employment_type,
                "job_summary": processed_job.job_summary,
                "key_responsibilities": json.loads(processed_job.key_responsibilities).get("key_responsibilities", []) if processed_job.key_responsibilities else None,
                "qualifications": json.loads(processed_job.qualifications).get("qualifications", []) if processed_job.qualifications else None,
                "compensation_and_benefits": json.loads(processed_job.compensation_and_benfits) if processed_job.compensation_and_benfits else None,
                "application_info": json.loads(processed_job.application_info).get("application_info", []) if processed_job.application_info else None,
                "extracted_keywords": json.loads(processed_job.extracted_keywords).get("extracted_keywords", []) if processed_job.extracted_keywords else None,
                "processed_at": processed_job.processed_at.isoformat() if processed_job.processed_at else None,
            }

        return combined_data
