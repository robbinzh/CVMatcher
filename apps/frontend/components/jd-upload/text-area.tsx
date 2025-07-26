'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useResumePreview } from '@/components/common/resume_previewer_context';
import { uploadJobDescriptions, improveResume } from '@/lib/api/resume';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';
type ImprovementStatus = 'idle' | 'improving' | 'error';

export default function JobDescriptionUploadTextArea() {
	const [text, setText] = useState('');
	const [flash, setFlash] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
	const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
	const [improvementStatus, setImprovementStatus] = useState<ImprovementStatus>('idle');
	const [jobId, setJobId] = useState<string | null>(null);

	const { setImprovedData } = useResumePreview();
	const resumeId = useSearchParams().get('resume_id')!;
	const router = useRouter();

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setText(e.target.value);
			setFlash(null);
			if (submissionStatus !== 'idle') setSubmissionStatus('idle');
		},
		[submissionStatus]
	);

	const handleUpload = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = text.trim();
			if (!trimmed) {
				setFlash({ type: 'error', message: '工作描述不能为空。' });
				return;
			}
			if (!resumeId) {
				setFlash({ type: 'error', message: '缺少简历ID。' });
				return;
			}

			setSubmissionStatus('submitting');
			try {
				const id = await uploadJobDescriptions([trimmed], resumeId);
				setJobId(id);
				setSubmissionStatus('success');
				setFlash({ type: 'success', message: '工作描述提交成功！' });
			} catch (err) {
				console.error(err);
				setSubmissionStatus('error');
				setFlash({ type: 'error', message: (err as Error).message });
			}
		},
		[text, resumeId]
	);

	const handleImprove = useCallback(async () => {
		if (!jobId) return;

		setImprovementStatus('improving');
		try {
			const preview = await improveResume(resumeId, jobId);
			setImprovedData(preview);
			router.push('/dashboard');
		} catch (err) {
			console.error(err);
			setImprovementStatus('error');
			setFlash({ type: 'error', message: (err as Error).message });
		}
	}, [resumeId, jobId, setImprovedData, router]);

	const isNextDisabled = text.trim() === '' || submissionStatus === 'submitting';

	return (
		<form onSubmit={handleUpload} className="p-4 mx-auto w-full max-w-xl">
			{flash && (
				<div
					className={`p-3 mb-4 text-sm rounded-md ${flash.type === 'error'
						? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-300'
						: 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-300'
						}`}
					role="alert"
				>
					<p>{flash.message}</p>
				</div>
			)}

			<div className="mb-6 relative">
				<label
					htmlFor="jobDescription"
					className="bg-slate-900/90 backdrop-blur-sm text-cyan-300 absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
				>
					工作描述 <span className="text-pink-400">*</span>
				</label>
				<Textarea
					id="jobDescription"
					rows={15}
					value={text}
					onChange={handleChange}
					required
					aria-required="true"
					placeholder="请在此处粘贴工作描述..."
					className="w-full bg-slate-800/50 backdrop-blur-sm focus:ring-1 border rounded-md border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/50 min-h-[300px] text-gray-100 placeholder:text-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300"
				/>
			</div>

			<div className="flex gap-3 justify-center">
				<Button
					type="submit"
					disabled={isNextDisabled}
					className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-md shadow-lg transition-all duration-300 border border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{submissionStatus === 'submitting' ? '提交中...' : '提交工作描述'}
				</Button>

				{submissionStatus === 'success' && jobId && (
					<Button
						type="button"
						onClick={handleImprove}
						disabled={improvementStatus === 'improving'}
						className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-md shadow-lg transition-all duration-300 border border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{improvementStatus === 'improving' ? '分析中...' : '简历分析'}
					</Button>
				)}
			</div>
		</form>
	);
}