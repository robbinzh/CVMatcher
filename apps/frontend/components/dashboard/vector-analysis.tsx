'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog';

interface SkillAnalysis {
	job_skill: string;
	best_resume_match: string;
	similarity_score: number;
	match_level: string;
	coverage_percentage: number;
}

interface CoverageGap {
	missing_skill: string;
	gap_severity: string;
	suggested_action: string;
}

interface StrengthArea {
	strong_skill: string;
	resume_match: string;
	strength_level: string;
}

interface CoverageStats {
	high_coverage: number;
	medium_coverage: number;
	low_coverage: number;
	total_skills_required: number;
	well_matched_skills: number;
	gaps_count: number;
}

interface VectorAnalysisData {
	skill_by_skill_analysis: SkillAnalysis[];
	coverage_gaps: CoverageGap[];
	strength_areas: StrengthArea[];
	coverage_statistics: CoverageStats;
	detailed_recommendations: any[];
}

interface VectorAnalysisProps {
	vectorAnalysis: VectorAnalysisData;
}

const VectorAnalysis: React.FC<VectorAnalysisProps> = ({ vectorAnalysis }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const getMatchColor = (score: number) => {
		if (score > 0.8) return 'text-green-400 bg-green-500/20 border-green-500/30';
		if (score > 0.6) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
		if (score > 0.3) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
		return 'text-red-400 bg-red-500/20 border-red-500/30';
	};

	const getMatchIcon = (score: number) => {
		if (score > 0.8) return '🎯';
		if (score > 0.6) return '✅';
		if (score > 0.3) return '⚡';
		return '❌';
	};

	const getPriorityColor = (severity: string) => {
		switch (severity) {
			case '高': return 'text-red-400 bg-red-500/20';
			case '中': return 'text-yellow-400 bg-yellow-500/20';
			default: return 'text-gray-400 bg-gray-500/20';
		}
	};

	return (
		<div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg shadow-xl text-gray-100 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogTrigger asChild>
					<div className="cursor-pointer">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">向量匹配分析</h3>
							<div className="text-sm text-gray-400">
								{vectorAnalysis.coverage_statistics.well_matched_skills}/{vectorAnalysis.coverage_statistics.total_skills_required} 技能高匹配
							</div>
						</div>
						
						{/* 技能覆盖率概览 */}
						<div className="grid grid-cols-3 gap-4 mb-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">
									{vectorAnalysis.coverage_statistics.high_coverage.toFixed(0)}%
								</div>
								<div className="text-xs text-gray-400">高匹配</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
									{vectorAnalysis.coverage_statistics.medium_coverage.toFixed(0)}%
								</div>
								<div className="text-xs text-gray-400">中等匹配</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
									{vectorAnalysis.coverage_statistics.low_coverage.toFixed(0)}%
								</div>
								<div className="text-xs text-gray-400">待改进</div>
							</div>
						</div>

						{/* 快速预览 */}
						<div className="space-y-2">
							<div className="text-sm">
								<span className="text-green-400">强势技能: </span>
								<span className="text-gray-300">
									{vectorAnalysis.strength_areas.slice(0, 3).map(s => s.strong_skill).join(', ') || '无'}
								</span>
							</div>
							<div className="text-sm">
								<span className="text-red-400">缺失技能: </span>
								<span className="text-gray-300">
									{vectorAnalysis.coverage_gaps.slice(0, 3).map(g => g.missing_skill).join(', ') || '无'}
								</span>
							</div>
						</div>

						<Button variant="link" className="text-purple-400 hover:text-purple-300 p-0 h-auto mt-3 text-sm transition-colors">
							查看详细向量分析
						</Button>
					</div>
				</DialogTrigger>

				<DialogContent className="bg-slate-900/95 backdrop-blur-md border border-purple-500/30 text-gray-100 sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[1200px] p-0 shadow-[0_0_30px_rgba(168,85,247,0.2)] max-h-[90vh] overflow-hidden">
					<DialogHeader className="p-6 border-b border-purple-500/30">
						<DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500">
							详细向量匹配分析
						</DialogTitle>
					</DialogHeader>

					<div className="p-6 max-h-[70vh] overflow-y-auto">
						{/* 技能匹配度详细分析 */}
						<div className="mb-8">
							<h4 className="text-xl font-semibold text-purple-300 mb-4 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">逐项技能匹配分析</h4>
							<div className="grid gap-3">
								{vectorAnalysis.skill_by_skill_analysis.map((skill, idx) => (
									<div key={idx} className={`p-4 rounded-lg border backdrop-blur-sm ${getMatchColor(skill.similarity_score)}`}>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<span className="text-2xl">{getMatchIcon(skill.similarity_score)}</span>
												<div>
													<div className="font-semibold">{skill.job_skill}</div>
													<div className="text-xs opacity-80">
														最佳匹配: {skill.best_resume_match}
													</div>
												</div>
											</div>
											<div className="text-right">
												<div className="text-lg font-bold">{(skill.similarity_score * 100).toFixed(0)}%</div>
												<div className="text-xs">{skill.match_level}</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* 技能缺口分析 */}
						{vectorAnalysis.coverage_gaps.length > 0 && (
							<div className="mb-8">
								<h4 className="text-xl font-semibold text-red-300 mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">技能缺口分析</h4>
								<div className="grid gap-3">
									{vectorAnalysis.coverage_gaps.map((gap, idx) => (
										<div key={idx} className={`p-4 rounded-lg border backdrop-blur-sm ${getPriorityColor(gap.gap_severity)}`}>
											<div className="flex items-center justify-between">
												<div>
													<div className="font-semibold">{gap.missing_skill}</div>
													<div className="text-xs opacity-80">{gap.suggested_action}</div>
												</div>
												<div className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(gap.gap_severity)}`}>
													{gap.gap_severity}优先级
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* 优势技能分析 */}
						{vectorAnalysis.strength_areas.length > 0 && (
							<div className="mb-8">
								<h4 className="text-xl font-semibold text-green-300 mb-4 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">优势技能分析</h4>
								<div className="grid gap-3">
									{vectorAnalysis.strength_areas.map((strength, idx) => (
										<div key={idx} className="p-4 rounded-lg border backdrop-blur-sm text-green-400 bg-green-500/20 border-green-500/30">
											<div className="flex items-center justify-between">
												<div>
													<div className="font-semibold flex items-center gap-2">
														<span>🌟</span>
														{strength.strong_skill}
													</div>
													<div className="text-xs opacity-80">
														简历匹配: {strength.resume_match}
													</div>
												</div>
												<div className="px-2 py-1 bg-green-500/30 rounded text-xs font-bold">
													{strength.strength_level}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* 统计概览 */}
						<div className="bg-slate-800/60 p-4 rounded-lg border border-purple-500/20">
							<h4 className="text-lg font-semibold text-purple-300 mb-3">统计概览</h4>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
								<div>
									<div className="text-2xl font-bold text-cyan-400">{vectorAnalysis.coverage_statistics.total_skills_required}</div>
									<div className="text-xs text-gray-400">总需求技能</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-green-400">{vectorAnalysis.coverage_statistics.well_matched_skills}</div>
									<div className="text-xs text-gray-400">高匹配技能</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-red-400">{vectorAnalysis.coverage_statistics.gaps_count}</div>
									<div className="text-xs text-gray-400">技能缺口</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-purple-400">
										{((vectorAnalysis.coverage_statistics.well_matched_skills / vectorAnalysis.coverage_statistics.total_skills_required) * 100).toFixed(0)}%
									</div>
									<div className="text-xs text-gray-400">整体覆盖率</div>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="p-6 border-t border-purple-500/30">
						<DialogClose asChild>
							<Button variant="outline" className="text-gray-100 bg-slate-800 hover:bg-slate-700 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
								关闭
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default VectorAnalysis; 