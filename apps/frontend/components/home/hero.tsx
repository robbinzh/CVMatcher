import React from 'react';
import Link from 'next/link';
import BackgroundContainer from '@/components/common/background-container';
import GitHubStarBadge from '@/components/common/github-star-badge';

export default function Hero() {
	return (
		<BackgroundContainer>
			<div className="relative mb-4 h-[30vh] w-full ">
				<div className="flex items-center justify-center mb-20">
					<GitHubStarBadge />
				</div>

				<h1 className="text-center text-8xl font-semibold bg-clip-text text-transparent bg-[linear-gradient(45deg,theme(colors.cyan.400),theme(colors.blue.500),theme(colors.purple.500),theme(colors.pink.500),theme(colors.cyan.400))] bg-[length:200%_auto] animate-[gradient_8s_linear_infinite] drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
					简历匹配器
				</h1>
			</div>
			<p className="mb-12 --font-space-grotesk text-center text-lg bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent md:text-xl drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
				通过完美匹配的简历提高您的面试机会
			</p>
			<Link
				href="/resume"
				className="group relative inline-flex h-12 overflow-hidden rounded-full p-[2px] transition-all duration-300 hover:scale-105"
			>
				<span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#06b6d4_0%,#3b82f6_25%,#8b5cf6_50%,#ec4899_75%,#06b6d4_100%)]" />
				<span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-cyan-300 backdrop-blur-3xl shadow-lg border border-cyan-500/30 hover:bg-slate-800 hover:text-cyan-200 transition-all duration-300 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]">
					{/* Inner glow effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<span className="relative z-10">开始使用</span>
					<svg
						width="16"
						height="16"
						viewBox="0 0 0.3 0.3"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						className="ml-2 transition-transform duration-200 ease-in-out group-hover:translate-x-1 relative z-10"
					>
						<path d="M.166.046a.02.02 0 0 1 .028 0l.09.09a.02.02 0 0 1 0 .028l-.09.09A.02.02 0 0 1 .166.226L.22.17H.03a.02.02 0 0 1 0-.04h.19L.166.074a.02.02 0 0 1 0-.028" />
					</svg>
				</span>
			</Link>
		</BackgroundContainer>
	);
}
