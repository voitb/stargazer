import { cn } from "@/lib/utils/cn";

interface MoonIconProps {
	className?: string;
}

export function MoonIcon({ className }: MoonIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className={cn("w-7 h-7", className)}
			aria-hidden="true"
		>
			<defs>
				<linearGradient
					id="moon-gradient"
					x1="0%"
					y1="0%"
					x2="100%"
					y2="100%"
				>
					<stop offset="0%" stopColor="rgb(var(--color-brand-background))" />
					<stop offset="100%" stopColor="rgb(var(--color-brand-background) / 0.6)" />
				</linearGradient>
				<filter id="moon-glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="1" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
			<path
				d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
				fill="url(#moon-gradient)"
				filter="url(#moon-glow)"
			/>
		</svg>
	);
}
