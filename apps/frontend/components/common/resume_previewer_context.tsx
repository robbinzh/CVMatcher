'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PersonalInfo {
    name: string;
    title?: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
}

export interface ExperienceEntry {
    id: number;
    title: string;
    company: string;
    location?: string;
    years?: string;
    description: string[];
}

export interface EducationEntry {
    id: number;
    institution: string;
    degree: string;
    years?: string;
    description?: string;
}

export interface ResumePreview {
    personalInfo: PersonalInfo;
    summary?: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: string[];
}

export interface Data {
    request_id: string;
    resume_id: string;
    job_id: string;
    original_score: number;
    new_score: number;
    resume_preview: ResumePreview;
    details?: string;
    commentary?: string;
    improvements?: {
        suggestion: string;
        lineNumber?: string | number;
    }[];
    vector_analysis?: {
        skill_by_skill_analysis: Array<{
            job_skill: string;
            best_resume_match: string;
            similarity_score: number;
            match_level: string;
            coverage_percentage: number;
        }>;
        coverage_gaps: Array<{
            missing_skill: string;
            gap_severity: string;
            suggested_action: string;
        }>;
        strength_areas: Array<{
            strong_skill: string;
            resume_match: string;
            strength_level: string;
        }>;
        coverage_statistics: {
            high_coverage: number;
            medium_coverage: number;
            low_coverage: number;
            total_skills_required: number;
            well_matched_skills: number;
            gaps_count: number;
        };
        detailed_recommendations: Array<{
            type: string;
            skill?: string;
            suggestion: string;
            priority: string;
            action: string;
        }>;
    };
}

export interface ImprovedResult {
    data: Data;
}

interface ContextValue {
    improvedData: ImprovedResult | null;
    setImprovedData: (data: ImprovedResult | null) => void;
}

const ResumePreviewContext = createContext<ContextValue | undefined>(undefined);

export function ResumePreviewProvider({ children }: { children: ReactNode }) {
    const [improvedData, setImprovedData] = useState<ImprovedResult | null>(null);
    return (
        <ResumePreviewContext.Provider value={{ improvedData, setImprovedData }}>
            {children}
        </ResumePreviewContext.Provider>
    );
}

export function useResumePreview(): ContextValue {
    const ctx = useContext(ResumePreviewContext);
    if (!ctx) throw new Error('useResumePreview must be used within ResumePreviewProvider');
    return ctx;
}