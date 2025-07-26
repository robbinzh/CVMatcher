import enum
from typing import Optional, List, Union
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime


class EmploymentTypeEnum(str, enum.Enum):
    """Case-insensitive Enum for employment types."""

    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    INTERNSHIP = "Internship"
    TEMPORARY = "Temporary"
    NOT_SPECIFIED = "Not Specified"

    @classmethod
    def _missing_(cls, value: object):
        """Handles case-insensitive lookup."""
        if isinstance(value, str):
            value_lower = value.lower().strip()
            # Create a comprehensive mapping
            mapping = {
                'full-time': cls.FULL_TIME,
                'fulltime': cls.FULL_TIME,
                'full time': cls.FULL_TIME,
                'permanent': cls.FULL_TIME,
                'part-time': cls.PART_TIME,
                'parttime': cls.PART_TIME,
                'part time': cls.PART_TIME,
                'contract': cls.CONTRACT,
                'contractor': cls.CONTRACT,
                'freelance': cls.CONTRACT,
                'internship': cls.INTERNSHIP,
                'intern': cls.INTERNSHIP,
                'temporary': cls.TEMPORARY,
                'temp': cls.TEMPORARY,
                'not specified': cls.NOT_SPECIFIED,
                'unspecified': cls.NOT_SPECIFIED,
                'unknown': cls.NOT_SPECIFIED,
                '': cls.NOT_SPECIFIED,
            }
            
            if value_lower in mapping:
                return mapping[value_lower]
            
            # Try exact match with enum values
            for member in cls:
                if member.value.lower() == value_lower:
                    return member
                    
        # Default fallback
        return cls.NOT_SPECIFIED


class RemoteStatusEnum(str, enum.Enum):
    """Case-insensitive Enum for remote work status."""

    FULLY_REMOTE = "Fully Remote"
    HYBRID = "Hybrid"
    ON_SITE = "On-site"
    REMOTE = "Remote"
    NOT_SPECIFIED = "Not Specified"
    MULTIPLE_LOCATIONS = "Multiple Locations"

    @classmethod
    def _missing_(cls, value: object):
        """Handles case-insensitive lookup."""
        if isinstance(value, str):
            value_lower = value.lower().strip()
            # Create a comprehensive mapping
            mapping = {
                'fully remote': cls.FULLY_REMOTE,
                'full remote': cls.FULLY_REMOTE,
                'completely remote': cls.FULLY_REMOTE,
                '100% remote': cls.FULLY_REMOTE,
                'remote': cls.REMOTE,
                'work from home': cls.REMOTE,
                'wfh': cls.REMOTE,
                'hybrid': cls.HYBRID,
                'mixed': cls.HYBRID,
                'on-site': cls.ON_SITE,
                'onsite': cls.ON_SITE,
                'on site': cls.ON_SITE,
                'office': cls.ON_SITE,
                'in-person': cls.ON_SITE,
                'not specified': cls.NOT_SPECIFIED,
                'unspecified': cls.NOT_SPECIFIED,
                'unknown': cls.NOT_SPECIFIED,
                '': cls.NOT_SPECIFIED,
                'multiple locations': cls.MULTIPLE_LOCATIONS,
                'various locations': cls.MULTIPLE_LOCATIONS,
            }
            
            if value_lower in mapping:
                return mapping[value_lower]
            
            # Try exact match with enum values  
            for member in cls:
                if member.value.lower() == value_lower:
                    return member
                    
        # Default fallback
        return cls.NOT_SPECIFIED


class CompanyProfile(BaseModel):
    company_name: str = Field(..., alias="companyName")
    industry: Optional[str] = Field(default=None)
    website: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)

    @field_validator('company_name')
    @classmethod
    def validate_company_name(cls, v):
        if not v or not v.strip():
            return "Unknown Company"
        return v.strip()


class Location(BaseModel):
    city: Optional[str] = Field(default=None)
    state: Optional[str] = Field(default=None)
    country: Optional[str] = Field(default=None)
    remote_status: RemoteStatusEnum = Field(default=RemoteStatusEnum.NOT_SPECIFIED, alias="remoteStatus")

    @field_validator('city', 'state', 'country')
    @classmethod
    def validate_location_fields(cls, v):
        if v and v.strip():
            return v.strip()
        return None


class Qualifications(BaseModel):
    required: List[str] = Field(default_factory=list)
    preferred: Optional[List[str]] = Field(default_factory=list)

    @field_validator('required', 'preferred')
    @classmethod
    def validate_qualifications(cls, v):
        if not v:
            return []
        return [item.strip() for item in v if item and item.strip()]


class CompensationAndBenefits(BaseModel):
    salary_range: Optional[str] = Field(default=None, alias="salaryRange")
    benefits: Optional[List[str]] = Field(default_factory=list)

    @field_validator('benefits')
    @classmethod
    def validate_benefits(cls, v):
        if not v:
            return []
        return [item.strip() for item in v if item and item.strip()]


class ApplicationInfo(BaseModel):
    how_to_apply: Optional[str] = Field(default=None, alias="howToApply")
    apply_link: Optional[str] = Field(default=None, alias="applyLink")
    contact_email: Optional[str] = Field(default=None, alias="contactEmail")


class StructuredJobModel(BaseModel):
    job_title: str = Field(..., alias="jobTitle")
    company_profile: CompanyProfile = Field(..., alias="companyProfile")
    location: Location = Field(default_factory=Location)
    date_posted: str = Field(default="", alias="datePosted")
    employment_type: EmploymentTypeEnum = Field(default=EmploymentTypeEnum.NOT_SPECIFIED, alias="employmentType")
    job_summary: str = Field(default="", alias="jobSummary")
    key_responsibilities: List[str] = Field(default_factory=list, alias="keyResponsibilities")
    qualifications: Qualifications = Field(default_factory=Qualifications)
    compensation_and_benefits: Optional[CompensationAndBenefits] = Field(
        default_factory=CompensationAndBenefits, alias="compensationAndBenefits"
    )
    application_info: Optional[ApplicationInfo] = Field(
        default_factory=ApplicationInfo, alias="applicationInfo"
    )
    extracted_keywords: List[str] = Field(default_factory=list, alias="extractedKeywords")

    @field_validator('job_title')
    @classmethod
    def validate_job_title(cls, v):
        if not v or not v.strip():
            return "Untitled Position"
        return v.strip()

    @field_validator('date_posted')
    @classmethod
    def validate_date_posted(cls, v):
        if not v or not v.strip():
            return datetime.now().strftime("%Y-%m-%d")
        return v.strip()

    @field_validator('key_responsibilities', 'extracted_keywords')
    @classmethod
    def validate_lists(cls, v):
        if not v:
            return []
        return [item.strip() for item in v if item and item.strip()]

    class ConfigDict:
        validate_by_name = True
        str_strip_whitespace = True
        extra = 'ignore'  # Ignore extra fields instead of raising error
