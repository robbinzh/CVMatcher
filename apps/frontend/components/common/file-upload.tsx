'use client';

import React, { useState } from 'react';
import {
	AlertCircleIcon,
	CheckCircle2Icon,
	Loader2Icon,
	PaperclipIcon,
	UploadIcon,
	XIcon,
} from 'lucide-react';
// Ensure FileMetadata is imported if you cast to it, or rely on structural typing.
// For this refinement, direct property access after casting to FileMetadata is used.
import { formatBytes, useFileUpload, FileMetadata } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';

const acceptedFileTypes = [
	'application/pdf', // .pdf
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

const acceptString = acceptedFileTypes.join(',');
const API_RESUME_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/upload`; // API endpoint

export default function FileUpload() {
	const maxSize = 2 * 1024 * 1024; // 2MB

	const [uploadFeedback, setUploadFeedback] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);

	const [
		{ files, isDragging, errors: validationOrUploadErrors, isUploadingGlobal },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			removeFile,
			getInputProps,
			clearErrors,
		},
	] = useFileUpload({
		maxSize,
		accept: acceptString,
		multiple: false,
		uploadUrl: API_RESUME_UPLOAD_URL,
		onUploadSuccess: (uploadedFile, response) => {
			console.log('Upload successful:', uploadedFile, response);
			// uploadedFile.file is FileMetadata here, as transformed by the hook
			const data = response as Record<string, unknown> & { resume_id?: string }
			const resumeId =
				typeof data.resume_id === 'string' ? data.resume_id : undefined

			if (!resumeId) {
				console.error('Missing resume_id in upload response', response)
				setUploadFeedback({
					type: 'error',
					message: '上传成功但未收到简历ID。',
				})
				return
			}

			setUploadFeedback({
				type: 'success',
				message: `${(uploadedFile.file as FileMetadata).name} 上传成功！`,
			});
			clearErrors();
			const encodedResumeId = encodeURIComponent(resumeId);
			window.location.href = `/jobs?resume_id=${encodedResumeId}`;
		},
		onUploadError: (file, errorMsg) => {
			console.error('Upload error:', file, errorMsg);
			setUploadFeedback({
				type: 'error',
				message: errorMsg || '上传过程中发生未知错误。',
			});
		},
		onFilesChange: (currentFiles) => {
			if (currentFiles.length === 0) {
				setUploadFeedback(null);
			}
		},
	});

	const currentFile = files[0];

	const handleRemoveFile = (id: string) => {
		removeFile(id);
		setUploadFeedback(null);
	};

	const displayErrors =
		uploadFeedback?.type === 'error' ? [uploadFeedback.message] : validationOrUploadErrors;

	return (
		<div className="flex w-full flex-col gap-4 rounded-lg">
			<div
				role="button"
				tabIndex={!currentFile && !isUploadingGlobal ? 0 : -1}
				onClick={!currentFile && !isUploadingGlobal ? openFileDialog : undefined}
				onKeyDown={(e) => {
					if ((e.key === 'Enter' || e.key === ' ') && !currentFile && !isUploadingGlobal)
						openFileDialog();
				}}
				onDragEnter={!isUploadingGlobal ? handleDragEnter : undefined}
				onDragLeave={!isUploadingGlobal ? handleDragLeave : undefined}
				onDragOver={!isUploadingGlobal ? handleDragOver : undefined}
				onDrop={!isUploadingGlobal ? handleDrop : undefined}
				data-dragging={isDragging || undefined}
				className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out py-12 px-6 flex flex-col items-center justify-center text-center backdrop-blur-sm
                    ${currentFile || isUploadingGlobal
						? 'cursor-not-allowed opacity-70 border-gray-600 bg-slate-800/50'
						: 'cursor-pointer border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
					}
                    ${isDragging && !isUploadingGlobal
						? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.4)]'
						: 'bg-slate-800/30'
					}`}
				aria-disabled={Boolean(currentFile) || isUploadingGlobal}
				aria-label={
					currentFile
						? '文件已选择。移除后可上传其他文件。'
						: '文件上传拖拽区域。拖拽文件或点击浏览。'
				}
			>
				<input {...getInputProps()} />
				{isUploadingGlobal ? (
					<>
						<Loader2Icon className="mb-4 size-10 animate-spin text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
						<p className="text-lg font-semibold text-cyan-300 mb-2">上传中...</p>
						<p className="text-sm text-gray-300">
							正在处理您的文件。
						</p>
					</>
				) : (
					<>
						<div className="mb-4 flex size-12 items-center justify-center rounded-full border border-cyan-500/50 bg-slate-800/80 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
							<UploadIcon className="size-6" />
						</div>
						<p className="mb-1 text-lg font-semibold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
							{currentFile ? '文件就绪' : '上传您的简历'}
						</p>
						<p className="text-sm text-gray-300">
							{currentFile
								? currentFile.file.name
								: `拖拽文件或点击上传（PDF、DOCX，最大 ${formatBytes(
									maxSize,
								)}）`}
						</p>
					</>
				)}
			</div>

			{displayErrors.length > 0 &&
				!isUploadingGlobal &&
				(!uploadFeedback || uploadFeedback.type === 'error') && (
					<div
						className="rounded-md border border-red-400/50 bg-red-900/30 backdrop-blur-sm p-3 text-sm text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
						role="alert"
					>
						<div className="flex items-start gap-2">
							<AlertCircleIcon className="mt-0.5 size-5 shrink-0" />
							<div>
								<p className="font-semibold">错误</p>
								{displayErrors.map((error, index) => (
									<p key={index}>{error}</p>
								))}
							</div>
						</div>
					</div>
				)}

			{uploadFeedback && uploadFeedback.type === 'success' && (
				<div
					className="rounded-md border border-green-400/50 bg-green-900/30 backdrop-blur-sm p-3 text-sm text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
					role="status"
				>
					<div className="flex items-start gap-2">
						<CheckCircle2Icon className="mt-0.5 size-5 shrink-0" />
						<div>
							<p className="font-semibold">成功</p>
							<p>{uploadFeedback.message}</p>
						</div>
					</div>
				</div>
			)}

			{currentFile && !isUploadingGlobal && (
				<div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 backdrop-blur-sm p-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
					<div className="flex items-center justify-between gap-3">
						<div className="flex min-w-0 items-center gap-3">
							<PaperclipIcon className="size-5 shrink-0 text-cyan-400" />
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium text-cyan-200">
									{currentFile.file.name}
								</p>
								<p className="text-xs text-gray-400">
									{formatBytes(currentFile.file.size)} -{' '}
									{(currentFile.file as FileMetadata).uploaded === true
										? '已上传'
										: (currentFile.file as FileMetadata).uploadError
											? '上传失败'
											: '等待上传'}
								</p>
							</div>
						</div>
						<Button
							size="icon"
							variant="ghost"
							className="size-8 shrink-0 text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition-colors"
							onClick={() => handleRemoveFile(currentFile.id)}
							aria-label="移除文件"
							disabled={isUploadingGlobal}
						>
							<XIcon className="size-5" />
						</Button>
					</div>
					{/* Display uploadError if it exists on FileMetadata */}
					{(currentFile.file as FileMetadata).uploadError && (
						<p className="mt-2 text-xs text-red-500 dark:text-red-400">
							{/* Error: {(currentFile.file as FileMetadata).uploadError} */}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
