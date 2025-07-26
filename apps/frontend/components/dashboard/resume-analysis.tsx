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

interface ImprovementSuggestion {
	suggestion: string;
	lineNumber?: string | number;
}

export interface ResumeAnalysisProps {
	score: number;
	details: string;
	commentary: string;
	improvements: ImprovementSuggestion[];
}

const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({
	score,
	details,
	commentary,
	improvements,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const getScoreColor = (value: number) => {
		if (value >= 80) return 'text-green-400';
		if (value >= 60) return 'text-yellow-400';
		return 'text-red-400';
	};

	const getScoreGlow = (value: number) => {
		if (value >= 80) return 'drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]';
		if (value >= 60) return 'drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]';
		return 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]';
	};

	const truncatedDetails = details.length > 100 ? details.slice(0, 97) + '...' : details;
	const truncatedCommentary = commentary.length > 100 ? commentary.slice(0, 97) + '...' : commentary;

	return (
		<div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg shadow-xl text-gray-100 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogTrigger asChild>
					<div className="cursor-pointer">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">简历分析</h3>
							<div className={`text-3xl font-bold ${getScoreColor(score)} ${getScoreGlow(score)}`}>
								{score}
								<span className="text-sm text-gray-400">/100</span>
							</div>
						</div>
						<p className="text-sm text-gray-300 mb-2">{truncatedDetails}</p>
						<p className="text-sm text-gray-300">{truncatedCommentary}</p>
						<Button variant="link" className="text-cyan-400 hover:text-cyan-300 p-0 h-auto mt-2 text-sm transition-colors">
							查看详细分析
						</Button>
					</div>
				</DialogTrigger>

				<DialogContent className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 text-gray-100 sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
					<DialogHeader className="p-6 border-b border-cyan-500/30">
						<DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
							详细简历分析报告
						</DialogTitle>
					</DialogHeader>

					<div className="p-6 max-h-[70vh] overflow-y-auto">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
							<div className="md:col-span-1 bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/20">
								<h4 className="text-lg font-semibold text-cyan-300 mb-2 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">总体评分</h4>
								<div className="flex items-center justify-center">
									<div className={`text-6xl font-bold ${getScoreColor(score)} ${getScoreGlow(score)}`}>{score}</div>
									<div className="text-2xl text-gray-400">/100</div>
								</div>
								<div className="w-full bg-slate-700 rounded-full h-2.5 mt-3 shadow-inner">
									<div
										className={`h-2.5 rounded-full transition-all duration-500 ${score >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
											}`}
										style={{ width: `${score}%` }}
									/>
								</div>
							</div>

							<div className="md:col-span-2 bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/20">
								<h4 className="text-lg font-semibold text-cyan-300 mb-2 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">分析摘要</h4>
								<p className="text-gray-300 text-sm mb-3 leading-relaxed">
									<strong className="text-cyan-300">详细信息：</strong> {details}
								</p>
								<p className="text-gray-300 text-sm leading-relaxed">
									<strong className="text-cyan-300">评价：</strong> {commentary}
								</p>
							</div>
						</div>

						<div>
							<h4 className="text-xl font-semibold text-cyan-300 mb-3 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">改进建议</h4>
							{improvements.length > 0 ? (
								<ul className="space-y-3">
									{improvements.map((item, idx) => (
										<li key={idx} className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-md shadow-lg border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
											<p className="text-gray-200 text-sm leading-relaxed">{item.suggestion}</p>
											{item.lineNumber && (
												<p className="text-xs text-purple-400 mt-1">参考位置: {item.lineNumber}</p>
											)}
										</li>
									))}
								</ul>
							) : (
								<p className="text-gray-400 text-sm bg-slate-800/40 p-4 rounded-lg border border-gray-600/30">暂时没有具体的改进建议。</p>
							)}
						</div>
					</div>

					<DialogFooter className="p-6 border-t border-cyan-500/30">
						<DialogClose asChild>
							<Button variant="outline" className="text-gray-100 bg-slate-800 hover:bg-slate-700 border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300">
								关闭
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ResumeAnalysis;