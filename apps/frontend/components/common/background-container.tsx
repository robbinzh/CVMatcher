import { DotPattern } from '@/components/common/dot-pattern-glow';
import { cn } from '@/lib/utils';

/**
 * BackgroundContainer Component
 *
 * Provides a full-screen section with a gradient background,
 * a bright inner container with rounded corners, and a glowing dot pattern.
 * It accepts children elements to render inside the inner container.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be rendered inside the container.
 * @param {string} [props.className] - Optional additional class names for the section element.
 * @param {string} [props.innerClassName] - Optional additional class names for the inner div element.
 * @param {string} [props.dotClassName] - Optional additional class names for the DotPattern component.
 * @returns {JSX.Element} The rendered BackgroundContainer component.
 */

interface BackgroundContainerProps {
	children: React.ReactNode;
	className?: string;
	innerClassName?: string;
	dotClassName?: string;
}

const BackgroundContainer = ({
	children,
	className,
	innerClassName,
	dotClassName,
}: BackgroundContainerProps) => {
	return (
		<section
			className={cn(
				'relative flex h-screen items-center justify-center overflow-hidden p-2 bg-gradient-to-br from-gray-900 via-slate-900 to-black',
				className,
			)}
		>
			{/* Animated tech grid background */}
			<div className="absolute inset-0 opacity-20">
				<div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
			</div>
			
			{/* Floating geometric shapes */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyan-500/30 rotate-45 animate-spin-slow"></div>
				<div className="absolute top-3/4 right-1/4 w-24 h-24 border border-purple-500/30 rotate-12 animate-bounce-slow"></div>
				<div className="absolute bottom-1/4 left-3/4 w-16 h-16 border border-pink-500/30 animate-pulse"></div>
			</div>

			{/* Inner container with cyber-tech styling */}
			<div
				className={cn(
					'relative z-10 flex h-full w-full flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-cyan-500/30 shadow-cyan-500/20',
					innerClassName,
				)}
			>
				{/* Enhanced dot pattern with tech colors */}
				<DotPattern
					cr={2}
					glow={true}
					className={cn(
						'absolute inset-0 -z-10 text-cyan-400 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]',
						dotClassName,
					)}
				/>
				
				{/* Neon border glow effect */}
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse -z-5"></div>
				
				{/* Content */}
				<div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
					{children}
				</div>
			</div>
		</section>
	);
};

export default BackgroundContainer;
