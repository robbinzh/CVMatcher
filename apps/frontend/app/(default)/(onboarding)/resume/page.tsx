'use client';

import BackgroundContainer from '@/components/common/background-container';
import FileUpload from '@/components/common/file-upload';

export default function UploadResume() {
	return (
		<BackgroundContainer innerClassName="justify-start pt-16">
			<div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
				<h1 className="text-4xl font-bold text-center text-cyan-300 mb-6 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
					上传您的简历
				</h1>
				<p className="text-center text-gray-300 mb-8 leading-relaxed">
					请拖拽简历文件到下方区域或点击浏览。支持格式：PDF、DOC、DOCX（最大 2 MB）。
				</p>
				<div className="w-full">
					<FileUpload />
				</div>
			</div>
		</BackgroundContainer>
	);
}
