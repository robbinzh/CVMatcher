// File: apps/frontend/app/dashboard/page.tsx


'use client';

import React, { useState } from 'react';
import BackgroundContainer from '@/components/common/background-container';
import JobListings from '@/components/dashboard/job-listings';
import ResumeAnalysis from '@/components/dashboard/resume-analysis';
import Resume from '@/components/dashboard/resume-component'; // rename import to match default export
import VectorAnalysis from '@/components/dashboard/vector-analysis';
import { useResumePreview } from '@/components/common/resume_previewer_context';
// import { analyzeJobDescription } from '@/lib/api/jobs';

// Type for the data expected from the analysis backend
type AnalyzedJobData = {
	title: string;
	company: string;
	location: string;
};

const mockResumeData = {
	personalInfo: {
		name: 'Ada Lovelace',
		title: 'Software Engineer & Visionary',
		email: 'ada.lovelace@example.com',
		phone: '+1-234-567-8900',
		location: 'London, UK',
		website: 'analyticalengine.dev',
		linkedin: 'linkedin.com/in/adalovelace',
		github: 'github.com/adalovelace',
	},
	summary:
		'Pioneering computer programmer with a strong foundation in mathematics and analytical thinking. Known for writing the first algorithm intended to be carried out by a machine. Seeking challenging opportunities to apply analytical skills to modern computing problems.',
	experience: [
		{
			id: 1,
			title: 'Collaborator & Algorithm Designer',
			company: "Charles Babbage's Analytical Engine Project",
			location: 'London, UK',
			years: '1842 - 1843',
			description: [
				"Developed the first published algorithm intended for implementation on a computer, Charles Babbage's Analytical Engine.",
				"Translated Luigi Menabrea's memoir on the Analytical Engine, adding extensive notes (Notes G) which included the algorithm.",
				'Foresaw the potential for computers to go beyond mere calculation, envisioning applications in music and art.',
			],
		},
	],
	education: [
		{
			id: 1,
			institution: 'Self-Taught & Private Tutoring',
			degree: 'Mathematics and Science',
			years: 'Early 19th Century',
			description:
				'Studied mathematics and science extensively under tutors like Augustus De Morgan, a prominent mathematician.',
		},
		// Add more education objects here if needed
	],
	skills: [
		'Algorithm Design',
		'Analytical Thinking',
		'Mathematical Modeling',
		'Computational Theory',
		'Technical Writing',
		'French (Translation)',
		'Symbolic Logic',
	],
};

export default function DashboardPage() {
	const { improvedData, setImprovedData } = useResumePreview();
	const [activeTab, setActiveTab] = useState<'metrics' | 'resume'>('metrics');
	
	console.log('Dashboard - Improved Data:', improvedData);
	
	// 如果没有数据，显示加载状态或空状态
	if (!improvedData) {
		console.log('Dashboard - No data available, showing empty state');
		return (
			<BackgroundContainer className="min-h-screen" innerClassName="bg-slate-900/90 backdrop-blur-md overflow-auto">
				{/* 主要内容区域 */}
				<div className="container mx-auto px-4 py-8">
					{/* 标题和描述 */}
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] mb-3">
							您的简历匹配器 仪表板
						</h1>
						<p className="text-lg text-gray-300/90 max-w-2xl mx-auto">
							管理您的简历并分析其与工作描述的匹配度。
						</p>
					</div>

					{/* 显示指导信息 */}
					<div className="mt-8 bg-slate-800/40 backdrop-blur-sm p-8 rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
						<div className="text-center">
							<div className="text-6xl mb-4">🚀</div>
							<h2 className="text-2xl font-bold text-cyan-400 mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
								开始您的简历优化之旅
							</h2>
							<div className="text-gray-300 space-y-3 max-w-2xl mx-auto">
								<p className="text-lg">按照以下步骤获取详细的匹配分析：</p>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
									<div className="bg-slate-700/50 p-4 rounded-lg border border-purple-500/20">
										<div className="text-purple-400 font-semibold mb-2">📝 步骤 1-2</div>
										<div className="text-sm mb-3">上传简历 → 提交工作描述</div>
										<a 
											href="/resume" 
											className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg hover:shadow-purple-500/25"
										>
											开始上传简历
										</a>
									</div>
									<div className="bg-slate-700/50 p-4 rounded-lg border border-cyan-500/20">
										<div className="text-cyan-400 font-semibold mb-2">🎯 步骤 3-4</div>
										<div className="text-sm mb-3">AI分析 → 查看详细报告</div>
										<a 
											href="/jobs" 
											className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg hover:shadow-cyan-500/25"
										>
											提交工作描述
										</a>
									</div>
								</div>
								<p className="text-sm text-gray-400 mt-4">
									💡 提示：完成所有步骤后，您将看到详细的向量分析、技能匹配度和改进建议
								</p>
							</div>
						</div>
					</div>
				</div>
			</BackgroundContainer>
		);
	}

	// 添加调试信息
	console.log('Dashboard - Full improved data:', improvedData);
	console.log('Dashboard - Scores:', {
		original: improvedData.data.original_score,
		new: improvedData.data.new_score
	});
	console.log('Dashboard - Resume preview:', improvedData.data.resume_preview);

	// 计算百分比和提升幅度 - 添加数据验证
	const originalScore = improvedData.data.original_score;
	const newScore = improvedData.data.new_score;
	
	if (originalScore === undefined || newScore === undefined) {
		console.warn('Dashboard - Missing score data:', { originalScore, newScore });
	}
	
	const originalPct = Math.round((originalScore ?? 0) * 100);
	const newPct = Math.round((newScore ?? 0) * 100);
	const improvementPct = newPct - originalPct;

	const resumeData = improvedData.data.resume_preview;

	const handleJobUpload = async (text: string): Promise<AnalyzedJobData | null> => {
		alert('工作分析功能已集成到后端处理流程中');
		return null;
	};

	return (
		<BackgroundContainer className="min-h-screen" innerClassName="bg-slate-900/90 backdrop-blur-md overflow-auto">
			{/* 主要内容区域 */}
			<div className="container mx-auto px-4 py-6">
				{/* 顶部标题 */}
				<div className="text-center mb-6">
					<h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] mb-2">
						简历匹配分析仪表板
					</h1>
					<p className="text-sm text-gray-300/90">
						详细的匹配分析和改进建议
					</p>
				</div>

				{/* 左右分页布局 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
					{/* 左侧：指标和工具区 */}
					<div className="space-y-6 overflow-y-auto pr-2">
						{/* 分数对比卡片 */}
						{improvedData && originalScore !== undefined && newScore !== undefined && (
							<div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-purple-500/30">
								<h3 className="text-lg font-semibold text-purple-300 mb-4 text-center">📊 匹配度评分</h3>
								<div className="grid grid-cols-3 gap-4 items-center">
									<div className="text-center">
										<div className="text-xs text-gray-400 mb-1">原始匹配度</div>
										<div className="text-2xl font-bold text-gray-300">{originalPct}%</div>
									</div>
									<div className="text-center">
										<div className="text-2xl text-cyan-400">→</div>
										<div className="text-xs text-gray-400">AI优化后</div>
									</div>
									<div className="text-center">
										<div className="text-xs text-gray-400 mb-1">优化后匹配度</div>
										<div className="text-2xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">{newPct}%</div>
										{improvementPct !== 0 && (
											<div className={`text-xs mt-1 ${improvementPct > 0 ? 'text-green-400' : 'text-red-400'}`}>
												{improvementPct > 0 ? '+' : ''}{improvementPct}% 变化
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* 向量分析指标 */}
						{improvedData?.data?.vector_analysis && (
							<VectorAnalysis vectorAnalysis={improvedData.data.vector_analysis} />
						)}

						{/* 工作上传区域 */}
						<JobListings onUploadJob={handleJobUpload} />
					</div>

					{/* 右侧：详细分析区 */}
					<div className="space-y-6 overflow-y-auto pr-2">
						{/* 标签切换 */}
						<div className="flex space-x-1 bg-slate-800/40 p-1 rounded-lg">
							<button
								onClick={() => setActiveTab('metrics')}
								className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
									activeTab === 'metrics'
										? 'bg-cyan-600 text-white shadow-lg'
										: 'text-gray-300 hover:bg-slate-700/50'
								}`}
							>
								📈 详细分析
							</button>
							<button
								onClick={() => setActiveTab('resume')}
								className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
									activeTab === 'resume'
										? 'bg-cyan-600 text-white shadow-lg'
										: 'text-gray-300 hover:bg-slate-700/50'
								}`}
							>
								📄 优化简历
							</button>
						</div>

						{/* 内容区域 */}
						{activeTab === 'metrics' && improvedData && (
							<div className="space-y-6">
								{/* 简历分析卡片 */}
								<ResumeAnalysis
									score={newPct}
									details={improvedData.data.details ?? ''}
									commentary={improvedData.data.commentary ?? ''}
									improvements={improvedData.data.improvements ?? []}
								/>

								{/* 改进建议快速预览 */}
								{improvedData.data.improvements && improvedData.data.improvements.length > 0 && (
									<div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-yellow-500/30">
										<h3 className="text-lg font-semibold text-yellow-300 mb-4">💡 核心改进建议</h3>
										<div className="space-y-3">
											{improvedData.data.improvements.slice(0, 3).map((item: any, idx: number) => (
												<div key={idx} className="bg-slate-700/50 p-3 rounded-md text-sm">
													<p className="text-gray-200">{item.suggestion}</p>
													{item.lineNumber && (
														<p className="text-xs text-yellow-400 mt-1">位置: {item.lineNumber}</p>
													)}
												</div>
											))}
											{improvedData.data.improvements.length > 3 && (
												<p className="text-xs text-gray-400 text-center">
													还有 {improvedData.data.improvements.length - 3} 条建议，点击上方"查看详细分析"查看全部
												</p>
											)}
										</div>
									</div>
								)}
							</div>
						)}

						{activeTab === 'resume' && resumeData && (
							<div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-lg border border-cyan-500/30">
								<h3 className="text-lg font-semibold text-cyan-300 mb-4 text-center">📄 优化后的简历</h3>
								<Resume resumeData={resumeData} />
							</div>
						)}

						{activeTab === 'resume' && !resumeData && (
							<div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-lg border border-gray-500/30 text-center">
								<div className="text-4xl mb-4">📄</div>
								<h3 className="text-lg font-semibold text-gray-300 mb-2">简历数据不可用</h3>
								<p className="text-sm text-gray-400">简历预览数据缺失，请重新进行分析</p>
							</div>
						)}
					</div>
				</div>

				{/* 如果分数数据缺失，显示提示 */}
				{improvedData && (originalScore === undefined || newScore === undefined) && (
					<div className="mt-6">
						<div className="bg-yellow-900/40 backdrop-blur-sm p-4 rounded-lg border border-yellow-500/30">
							<div className="text-center text-yellow-300">
								<div className="mb-2">⚠️ 分析数据不完整，分数信息缺失</div>
								<button 
									onClick={() => {
										setImprovedData(null);
										console.log('Dashboard - Data cleared');
									}}
									className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
								>
									清除数据并重新开始
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</BackgroundContainer>
	);
}