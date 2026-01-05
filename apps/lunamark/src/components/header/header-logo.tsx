import { MoonIcon } from "@/components/icons/moon-icon";

export function HeaderLogo() {
	return (
		<div className="flex items-center gap-3 group" data-logo>
			<div
				className="relative transition-all duration-300 group-hover:scale-105"
				data-logo-icon
			>
				{/* Glow layer - visible on hover */}
				<div className="absolute inset-0 blur-xl bg-[rgb(var(--color-brand-background))] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
				<MoonIcon className="relative w-8 h-8" />
			</div>
			<div className="flex flex-col">
				<h1 className="text-lg font-semibold tracking-tight text-[rgb(var(--color-neutral-foreground-1))] group-hover:text-[rgb(var(--color-brand-background))] transition-colors duration-200">
					Lunamark
				</h1>
				<span className="text-[10px] uppercase tracking-[0.15em] text-[rgb(var(--color-neutral-foreground-2))] font-medium">
					Task Board
				</span>
			</div>
		</div>
	);
}
