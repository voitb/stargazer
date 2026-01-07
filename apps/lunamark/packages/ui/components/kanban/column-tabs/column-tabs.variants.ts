import { cva } from "class-variance-authority";

export const columnTabsVariants = cva(
	"flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none sticky top-0 z-10 backdrop-blur-md border-b border-[rgb(var(--color-neutral-stroke-1))/0.2]",
	{
		variants: {
			variant: {
				default: "bg-[rgb(var(--color-neutral-background-1))/0.9]",
			},
		},
	}
);

export const columnTabVariants = cva(
	"flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-brand-background))/0.5] min-h-11",
	{
		variants: {
			state: {
				active:
					"bg-[rgb(var(--color-brand-background))] text-[rgb(var(--color-brand-foreground-on-brand))] shadow-md",
				inactive:
					"bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-2))] hover:bg-[rgb(var(--color-neutral-background-3))/0.8]",
			},
		},
		defaultVariants: {
			state: "inactive",
		},
	}
);
