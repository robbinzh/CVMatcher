SCHEMA = {
    "jobTitle": "string",
    "companyProfile": {
        "companyName": "string",
        "industry": "Optional[string]",
        "website": "Optional[string]",
        "description": "Optional[string]",
    },
    "location": {
        "city": "Optional[string]",
        "state": "Optional[string]", 
        "country": "Optional[string]",
        "remoteStatus": "Must be one of: Fully Remote, Hybrid, On-site, Remote, Not Specified, Multiple Locations (case insensitive)",
    },
    "datePosted": "YYYY-MM-DD format string",
    "employmentType": "Must be one of: Full-time, Part-time, Contract, Internship, Temporary, Not Specified (case insensitive)",
    "jobSummary": "string",
    "keyResponsibilities": [
        "string",
        "string (add more as needed)",
    ],
    "qualifications": {
        "required": [
            "string",
            "string (add more as needed)",
        ],
        "preferred": [
            "string (this field is optional, can be empty array)",
        ],
    },
    "compensationAndBenefits": {
        "salaryRange": "Optional[string]",
        "benefits": [
            "Optional[string] (this field is optional, can be empty array)",
        ],
    },
    "applicationInfo": {
        "howToApply": "Optional[string]",
        "applyLink": "Optional[string]", 
        "contactEmail": "Optional[string]",
    },
    "extractedKeywords": [
        "string",
        "string (add more relevant keywords)",
    ],
}
