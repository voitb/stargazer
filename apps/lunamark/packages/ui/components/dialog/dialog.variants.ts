import { cva } from "class-variance-authority";

export const dialogOverlayVariants = cva([
	"fixed inset-0",
	"bg-[rgb(var(--color-overlay)/0.5)]",
]);

export const dialogContentVariants = cva(
	[
		"relative z-50 w-full gap-4 border p-6 shadow-lg",
		"bg-[rgb(var(--color-neutral-background-1))]",
		"text-[rgb(var(--color-neutral-foreground-1))]",
		"border-[rgb(var(--color-neutral-stroke-1))]",
		"rounded-lg",
	],
	{
		variants: {
			size: {
				sm: "max-w-sm",
				md: "max-w-lg",
				lg: "max-w-2xl",
				xl: "max-w-4xl",
				full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
);

export const dialogCloseVariants = cva([
	"absolute right-4 top-4 rounded-sm opacity-70 transition-opacity",
	"hover:opacity-100",
	"focus-visible:outline-none focus-visible:ring-2",
	"focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
	"disabled:pointer-events-none",
]);

export const dialogHeaderVariants = cva([
	"flex flex-col space-y-1.5 text-center sm:text-left",
]);

export const dialogTitleVariants = cva([
	"text-lg font-semibold leading-none tracking-tight",
]);

export const dialogDescriptionVariants = cva([
	"text-sm",
	"text-[rgb(var(--color-neutral-foreground-1))]/70",
]);

export const dialogFooterVariants = cva([
	"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
]);
