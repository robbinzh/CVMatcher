import gc
import json
import asyncio
import logging
import markdown
import numpy as np

from sqlalchemy.future import select
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Optional, Tuple, AsyncGenerator

from app.prompt import prompt_factory
from app.schemas.json import json_schema_factory
from app.schemas.pydantic import ResumePreviewerModel
from app.agent import EmbeddingManager, AgentManager
from app.models import Resume, Job, ProcessedResume, ProcessedJob
from .exceptions import (
    ResumeNotFoundError,
    JobNotFoundError,
    ResumeParsingError,
    JobParsingError,
    ResumeKeywordExtractionError,
    JobKeywordExtractionError,
)

logger = logging.getLogger(__name__)


class ScoreImprovementService:
    """
    Service to handle scoring of resumes and jobs using embeddings.
    Fetches Resume and Job data from the database, computes embeddings,
    and calculates cosine similarity scores. Uses LLM for iteratively improving
    the scoring process.
    """

    def __init__(self, db: AsyncSession, max_retries: int = 5):
        self.db = db
        self.max_retries = max_retries
        self.md_agent_manager = AgentManager(strategy="md")
        self.json_agent_manager = AgentManager()
        self.embedding_manager = EmbeddingManager()

    def _validate_resume_keywords(
        self, processed_resume: ProcessedResume, resume_id: str
    ) -> None:
        """
        Validates that keyword extraction was successful for a resume.
        Raises ResumeKeywordExtractionError if keywords are missing or empty.
        """
        if not processed_resume.extracted_keywords:
            raise ResumeKeywordExtractionError(resume_id=resume_id)

        try:
            keywords_data = json.loads(processed_resume.extracted_keywords)
            keywords = keywords_data.get("extracted_keywords", [])
            if not keywords or len(keywords) == 0:
                raise ResumeKeywordExtractionError(resume_id=resume_id)
        except json.JSONDecodeError:
            raise ResumeKeywordExtractionError(resume_id=resume_id)

    def _validate_job_keywords(self, processed_job: ProcessedJob, job_id: str) -> None:
        """
        Validates that keyword extraction was successful for a job.
        Raises JobKeywordExtractionError if keywords are missing or empty.
        """
        if not processed_job.extracted_keywords:
            raise JobKeywordExtractionError(job_id=job_id)

        try:
            keywords_data = json.loads(processed_job.extracted_keywords)
            keywords = keywords_data.get("extracted_keywords", [])
            if not keywords or len(keywords) == 0:
                raise JobKeywordExtractionError(job_id=job_id)
        except json.JSONDecodeError:
            raise JobKeywordExtractionError(job_id=job_id)

    async def _get_resume(
        self, resume_id: str
    ) -> Tuple[Resume | None, ProcessedResume | None]:
        """
        Fetches the resume from the database.
        """
        query = select(Resume).where(Resume.resume_id == resume_id)
        result = await self.db.execute(query)
        resume = result.scalars().first()

        if not resume:
            raise ResumeNotFoundError(resume_id=resume_id)

        query = select(ProcessedResume).where(ProcessedResume.resume_id == resume_id)
        result = await self.db.execute(query)
        processed_resume = result.scalars().first()

        if not processed_resume:
            raise ResumeParsingError(resume_id=resume_id)

        self._validate_resume_keywords(processed_resume, resume_id)

        return resume, processed_resume

    async def _get_job(self, job_id: str) -> Tuple[Job | None, ProcessedJob | None]:
        """
        Fetches the job from the database.
        """
        query = select(Job).where(Job.job_id == job_id)
        result = await self.db.execute(query)
        job = result.scalars().first()

        if not job:
            raise JobNotFoundError(job_id=job_id)

        query = select(ProcessedJob).where(ProcessedJob.job_id == job_id)
        result = await self.db.execute(query)
        processed_job = result.scalars().first()

        if not processed_job:
            raise JobParsingError(job_id=job_id)

        self._validate_job_keywords(processed_job, job_id)

        return job, processed_job

    def calculate_cosine_similarity(
        self,
        extracted_job_keywords_embedding: np.ndarray,
        resume_embedding: np.ndarray,
    ) -> float:
        """
        Calculates the cosine similarity between two embeddings.
        """
        if resume_embedding is None or extracted_job_keywords_embedding is None:
            return 0.0

        ejk = np.asarray(extracted_job_keywords_embedding).squeeze()
        re = np.asarray(resume_embedding).squeeze()

        return float(np.dot(ejk, re) / (np.linalg.norm(ejk) * np.linalg.norm(re)))

    async def improve_score_with_llm(
        self,
        resume: str,
        extracted_resume_keywords: str,
        job: str,
        extracted_job_keywords: str,
        previous_cosine_similarity_score: float,
        extracted_job_keywords_embedding: np.ndarray,
    ) -> Tuple[str, float]:
        prompt_template = prompt_factory.get("resume_improvement")
        best_resume, best_score = resume, previous_cosine_similarity_score

        for attempt in range(1, self.max_retries + 1):
            logger.info(
                f"Attempt {attempt}/{self.max_retries} to improve resume score."
            )
            prompt = prompt_template.format(
                raw_job_description=job,
                extracted_job_keywords=extracted_job_keywords,
                raw_resume=best_resume,
                extracted_resume_keywords=extracted_resume_keywords,
                current_cosine_similarity=best_score,
            )
            improved = await self.md_agent_manager.run(prompt)
            emb = await self.embedding_manager.embed(text=improved)
            score = self.calculate_cosine_similarity(
                emb, extracted_job_keywords_embedding
            )

            if score > best_score:
                return improved, score

            logger.info(
                f"Attempt {attempt} resulted in score: {score}, best score so far: {best_score}"
            )

        return best_resume, best_score

    async def _generate_analysis_details(
        self,
        original_score: float,
        new_score: float,
        resume_keywords: str,
        job_keywords: str,
        vector_analysis: Dict = None
    ) -> str:
        """生成详细的技能匹配分析"""
        # 分析关键词匹配情况
        resume_kw_list = [kw.strip().lower() for kw in resume_keywords.split(",") if kw.strip()]
        job_kw_list = [kw.strip().lower() for kw in job_keywords.split(",") if kw.strip()]
        
        matched_keywords = list(set(resume_kw_list) & set(job_kw_list))
        missing_keywords = list(set(job_kw_list) - set(resume_kw_list))
        
        score_improvement = (new_score - original_score) * 100
        
        details = f"""技能匹配分析：
• 匹配的关键技能 ({len(matched_keywords)}个): {', '.join(matched_keywords[:10]) if matched_keywords else '无直接匹配'}
• 待加强的技能 ({len(missing_keywords)}个): {', '.join(missing_keywords[:10]) if missing_keywords else '无'}
• 原始匹配度: {original_score:.1%}
• 优化后匹配度: {new_score:.1%}
• 分数提升: {score_improvement:+.1f}%
• 关键词覆盖率: {len(matched_keywords)/(len(job_kw_list) or 1):.1%}"""
        
        if vector_analysis:
            details += f"""
• 高匹配度技能 ({vector_analysis["coverage_statistics"]["well_matched_skills"]}个): {', '.join([s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if s["similarity_score"] > 0.7][:10]) if [s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if s["similarity_score"] > 0.7] else '无'}
• 中等匹配度技能 ({vector_analysis["coverage_statistics"]["medium_coverage"]}%): {', '.join([s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if 0.4 <= s["similarity_score"] <= 0.7][:10]) if [s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if 0.4 <= s["similarity_score"] <= 0.7] else '无'}
• 低匹配度技能 ({vector_analysis["coverage_statistics"]["low_coverage"]}%): {', '.join([s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if s["similarity_score"] < 0.4][:10]) if [s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if s["similarity_score"] < 0.4] else '无'}
"""
        
        return details

    async def _generate_analysis_commentary(
        self,
        original_score: float,
        new_score: float,
        resume: str,
        job: str,
        vector_analysis: Dict = None
    ) -> str:
        """生成整体匹配度评价"""
        score_pct = new_score * 100
        improvement = (new_score - original_score) * 100
        
        if score_pct >= 80:
            grade = "优秀"
            advice = "您的简历与职位要求高度匹配，建议直接投递申请。"
        elif score_pct >= 60:
            grade = "良好"
            advice = "匹配度较好，可考虑根据建议进一步优化后投递。"
        else:
            grade = "需要改进"
            advice = "建议重点关注缺失的技能要求，优化简历内容后再投递。"
            
        commentary = f"""整体评价: {grade} ({score_pct:.0f}分)
{advice}

通过AI优化，您的简历匹配度提升了 {improvement:+.1f} 个百分点。建议关注职位描述中的核心技能要求，确保简历充分体现相关经验和能力。"""
        
        if vector_analysis:
            commentary += f"""

向量分析结果：
• 高匹配度技能 ({vector_analysis["coverage_statistics"]["well_matched_skills"]}个): {', '.join([s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if s["similarity_score"] > 0.7][:10]) if [s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if s["similarity_score"] > 0.7] else '无'}
• 中等匹配度技能 ({vector_analysis["coverage_statistics"]["medium_coverage"]}%): {', '.join([s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if 0.4 <= s["similarity_score"] <= 0.7][:10]) if [s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if 0.4 <= s["similarity_score"] <= 0.7] else '无'}
• 低匹配度技能 ({vector_analysis["coverage_statistics"]["low_coverage"]}%): {', '.join([s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if s["similarity_score"] < 0.4][:10]) if [s["job_skill"] for s in vector_analysis["skill_by_skill_analysis"] if s["similarity_score"] < 0.4] else '无'}
"""
        
        return commentary

    async def _generate_improvement_suggestions(
        self,
        resume: str,
        job: str,
        score: float
    ) -> list:
        """生成具体的改进建议"""
        suggestions = []
        
        # 基于分数给出不同的建议
        if score < 0.6:
            suggestions.extend([
                {"suggestion": "建议重点突出与职位相关的核心技能和项目经验", "lineNumber": "技能部分"},
                {"suggestion": "考虑增加职位描述中提到的关键技术栈相关经验", "lineNumber": "工作经历"},
                {"suggestion": "使用更多职位描述中的专业术语和关键词", "lineNumber": "整体内容"},
            ])
        elif score < 0.8:
            suggestions.extend([
                {"suggestion": "进一步量化工作成果，使用具体的数字和指标", "lineNumber": "成就描述"},
                {"suggestion": "补充与职位要求匹配的技能认证或培训经历", "lineNumber": "教育背景"},
                {"suggestion": "优化项目描述，突出与目标职位相关的技术难点", "lineNumber": "项目经验"},
            ])
        else:
            suggestions.extend([
                {"suggestion": "简历匹配度已经很高，可考虑微调格式和表达方式", "lineNumber": "格式优化"},
                {"suggestion": "确保联系信息完整准确，便于HR联系", "lineNumber": "个人信息"},
            ])
            
        # 通用建议
        suggestions.append({
            "suggestion": "建议针对不同公司和职位定制简历内容，突出最相关的经验",
            "lineNumber": "整体策略"
        })
        
        return suggestions[:5]  # 限制建议数量

    async def _analyze_vector_components(
        self,
        resume_content: str,
        job_content: str,
        resume_keywords: str,
        job_keywords: str
    ) -> Dict:
        """深度向量分析：计算每个技能点的匹配度和偏离度"""
        
        # 分解关键词
        resume_kw_list = [kw.strip() for kw in resume_keywords.split(",") if kw.strip()]
        job_kw_list = [kw.strip() for kw in job_keywords.split(",") if kw.strip()]
        
        # 为每个技能点计算单独的向量相似度
        skill_analysis = []
        coverage_gaps = []
        strength_areas = []
        
        for job_skill in job_kw_list:
            # 计算每个职位要求技能的匹配度
            job_skill_embedding = await self.embedding_manager.embed(job_skill)
            
            # 查找简历中最相关的技能
            best_match_score = 0.0
            best_match_skill = None
            
            for resume_skill in resume_kw_list:
                resume_skill_embedding = await self.embedding_manager.embed(resume_skill)
                similarity = self.calculate_cosine_similarity(
                    np.array(job_skill_embedding), 
                    np.array(resume_skill_embedding)
                )
                
                if similarity > best_match_score:
                    best_match_score = similarity
                    best_match_skill = resume_skill
            
            # 分析匹配程度
            match_level = "强匹配" if best_match_score > 0.8 else \
                         "中等匹配" if best_match_score > 0.6 else \
                         "弱匹配" if best_match_score > 0.3 else "未覆盖"
            
            skill_analysis.append({
                "job_skill": job_skill,
                "best_resume_match": best_match_skill or "无匹配",
                "similarity_score": best_match_score,
                "match_level": match_level,
                "coverage_percentage": best_match_score * 100
            })
            
            # 分类技能差距和优势
            if best_match_score < 0.4:
                coverage_gaps.append({
                    "missing_skill": job_skill,
                    "gap_severity": "高" if best_match_score < 0.2 else "中",
                    "suggested_action": "重点补强" if best_match_score < 0.2 else "适度加强"
                })
            elif best_match_score > 0.7:
                strength_areas.append({
                    "strong_skill": job_skill,
                    "resume_match": best_match_skill,
                    "strength_level": "核心优势" if best_match_score > 0.85 else "明显优势"
                })
        
        # 计算各维度覆盖率
        high_match_count = sum(1 for s in skill_analysis if s["similarity_score"] > 0.7)
        medium_match_count = sum(1 for s in skill_analysis if 0.4 <= s["similarity_score"] <= 0.7)
        low_match_count = sum(1 for s in skill_analysis if s["similarity_score"] < 0.4)
        
        total_skills = len(job_kw_list)
        coverage_stats = {
            "high_coverage": (high_match_count / total_skills * 100) if total_skills > 0 else 0,
            "medium_coverage": (medium_match_count / total_skills * 100) if total_skills > 0 else 0,
            "low_coverage": (low_match_count / total_skills * 100) if total_skills > 0 else 0,
            "total_skills_required": total_skills,
            "well_matched_skills": high_match_count,
            "gaps_count": low_match_count
        }
        
        return {
            "skill_by_skill_analysis": skill_analysis,
            "coverage_gaps": coverage_gaps,
            "strength_areas": strength_areas,
            "coverage_statistics": coverage_stats,
            "detailed_recommendations": await self._generate_vector_based_recommendations(
                skill_analysis, coverage_gaps, strength_areas
            )
        }

    async def _generate_vector_based_recommendations(
        self,
        skill_analysis: list,
        coverage_gaps: list,
        strength_areas: list
    ) -> list:
        """基于向量分析生成精准的改进建议"""
        recommendations = []
        
        # 基于缺失技能的建议
        high_priority_gaps = [gap for gap in coverage_gaps if gap["gap_severity"] == "高"]
        if high_priority_gaps:
            for gap in high_priority_gaps[:3]:  # 最多3个高优先级
                recommendations.append({
                    "type": "critical_gap",
                    "skill": gap["missing_skill"],
                    "suggestion": f"紧急补强 '{gap['missing_skill']}' 技能 - 这是职位的核心要求但简历中缺失",
                    "priority": "高",
                    "action": "添加相关项目经验或培训证书"
                })
        
        # 基于中等优先级缺失的建议
        medium_gaps = [gap for gap in coverage_gaps if gap["gap_severity"] == "中"]
        if medium_gaps:
            for gap in medium_gaps[:2]:  # 最多2个中等优先级
                recommendations.append({
                    "type": "moderate_gap",
                    "skill": gap["missing_skill"],
                    "suggestion": f"适度加强 '{gap['missing_skill']}' 相关经验的描述",
                    "priority": "中",
                    "action": "在现有经验中挖掘相关技能点"
                })
        
        # 基于优势技能的建议
        if strength_areas:
            top_strength = max(strength_areas, key=lambda x: 1 if x["strength_level"] == "核心优势" else 0)
            recommendations.append({
                "type": "leverage_strength",
                "skill": top_strength["strong_skill"],
                "suggestion": f"进一步突出 '{top_strength['strong_skill']}' 技能优势，这是您的核心竞争力",
                "priority": "中",
                "action": "量化成果，添加具体的项目案例"
            })
        
        # 基于技能分布的建议
        weak_skills = [s for s in skill_analysis if s["similarity_score"] < 0.3]
        if len(weak_skills) > len(skill_analysis) * 0.5:
            recommendations.append({
                "type": "overall_alignment",
                "suggestion": "简历与职位要求的整体匹配度较低，建议重新审视职位适合度或大幅调整简历内容",
                "priority": "高",
                "action": "考虑重点突出相关经验，或补充相关技能培训"
            })
        
        return recommendations

    async def get_resume_for_previewer(self, updated_resume: str) -> Dict:
        """
        Returns the updated resume in a format suitable for the dashboard.
        """
        prompt_template = prompt_factory.get("structured_resume")
        prompt = prompt_template.format(
            json.dumps(json_schema_factory.get("resume_preview"), indent=2),
            updated_resume,
        )
        logger.info(f"Structured Resume Prompt: {prompt}")
        raw_output = await self.json_agent_manager.run(prompt=prompt)

        try:
            resume_preview: ResumePreviewerModel = ResumePreviewerModel.model_validate(
                raw_output
            )
        except ValidationError as e:
            logger.info(f"Validation error: {e}")
            return None
        return resume_preview.model_dump()

    async def run(self, resume_id: str, job_id: str) -> Dict:
        """
        Main method to run the scoring and improving process and return dict.
        """

        resume, processed_resume = await self._get_resume(resume_id)
        job, processed_job = await self._get_job(job_id)

        extracted_job_keywords = ", ".join(
            json.loads(processed_job.extracted_keywords).get("extracted_keywords", [])
        )

        extracted_resume_keywords = ", ".join(
            json.loads(processed_resume.extracted_keywords).get(
                "extracted_keywords", []
            )
        )

        resume_embedding_task = asyncio.create_task(
            self.embedding_manager.embed(resume.content)
        )
        job_kw_embedding_task = asyncio.create_task(
            self.embedding_manager.embed(extracted_job_keywords)
        )
        resume_embedding, extracted_job_keywords_embedding = await asyncio.gather(
            resume_embedding_task, job_kw_embedding_task
        )

        cosine_similarity_score = self.calculate_cosine_similarity(
            extracted_job_keywords_embedding, resume_embedding
        )
        updated_resume, updated_score = await self.improve_score_with_llm(
            resume=resume.content,
            extracted_resume_keywords=extracted_resume_keywords,
            job=job.content,
            extracted_job_keywords=extracted_job_keywords,
            previous_cosine_similarity_score=cosine_similarity_score,
            extracted_job_keywords_embedding=extracted_job_keywords_embedding,
        )

        resume_preview = await self.get_resume_for_previewer(
            updated_resume=updated_resume
        )

        logger.info(f"Resume Preview: {resume_preview}")

        # 执行深度向量分析
        vector_analysis = await self._analyze_vector_components(
            resume_content=resume.content,
            job_content=job.content,
            resume_keywords=extracted_resume_keywords,
            job_keywords=extracted_job_keywords
        )

        # 生成详细分析报告
        details = await self._generate_analysis_details(
            original_score=cosine_similarity_score,
            new_score=updated_score,
            resume_keywords=extracted_resume_keywords,
            job_keywords=extracted_job_keywords,
            vector_analysis=vector_analysis
        )
        
        commentary = await self._generate_analysis_commentary(
            original_score=cosine_similarity_score,
            new_score=updated_score,
            resume=resume.content,
            job=job.content,
            vector_analysis=vector_analysis
        )
        
        improvements = vector_analysis["detailed_recommendations"]

        execution = {
            "resume_id": resume_id,
            "job_id": job_id,
            "original_score": cosine_similarity_score,
            "new_score": updated_score,
            "updated_resume": markdown.markdown(text=updated_resume),
            "resume_preview": resume_preview,
            "details": details,
            "commentary": commentary,
            "improvements": improvements,
            "vector_analysis": vector_analysis,  # 添加完整的向量分析数据
        }

        gc.collect()

        return execution

    async def run_and_stream(self, resume_id: str, job_id: str) -> AsyncGenerator:
        """
        Main method to run the scoring and improving process and return dict.
        """

        yield f"data: {json.dumps({'status': 'starting', 'message': 'Analyzing resume and job description...'})}\n\n"
        await asyncio.sleep(2)

        resume, processed_resume = await self._get_resume(resume_id)
        job, processed_job = await self._get_job(job_id)

        yield f"data: {json.dumps({'status': 'parsing', 'message': 'Parsing resume content...'})}\n\n"
        await asyncio.sleep(2)

        extracted_job_keywords = ", ".join(
            json.loads(processed_job.extracted_keywords).get("extracted_keywords", [])
        )

        extracted_resume_keywords = ", ".join(
            json.loads(processed_resume.extracted_keywords).get(
                "extracted_keywords", []
            )
        )

        resume_embedding = await self.embedding_manager.embed(text=resume.content)
        extracted_job_keywords_embedding = await self.embedding_manager.embed(
            text=extracted_job_keywords
        )

        yield f"data: {json.dumps({'status': 'scoring', 'message': 'Calculating compatibility score...'})}\n\n"
        await asyncio.sleep(3)

        cosine_similarity_score = self.calculate_cosine_similarity(
            extracted_job_keywords_embedding, resume_embedding
        )

        yield f"data: {json.dumps({'status': 'scored', 'score': cosine_similarity_score})}\n\n"

        yield f"data: {json.dumps({'status': 'improving', 'message': 'Generating improvement suggestions...'})}\n\n"
        await asyncio.sleep(3)

        updated_resume, updated_score = await self.improve_score_with_llm(
            resume=resume.content,
            extracted_resume_keywords=extracted_resume_keywords,
            job=job.content,
            extracted_job_keywords=extracted_job_keywords,
            previous_cosine_similarity_score=cosine_similarity_score,
            extracted_job_keywords_embedding=extracted_job_keywords_embedding,
        )

        for i, suggestion in enumerate(updated_resume):
            yield f"data: {json.dumps({'status': 'suggestion', 'index': i, 'text': suggestion})}\n\n"
            await asyncio.sleep(0.2)

        final_result = {
            "resume_id": resume_id,
            "job_id": job_id,
            "original_score": cosine_similarity_score,
            "new_score": updated_score,
            "updated_resume": markdown.markdown(text=updated_resume),
        }

        yield f"data: {json.dumps({'status': 'completed', 'result': final_result})}\n\n"
