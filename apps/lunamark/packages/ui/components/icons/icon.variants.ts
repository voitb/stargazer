import { cva } from "class-variance-authority";

const iconSizes = {
	xs: "h-3 w-3",
	sm: "h-4 w-4",
	md: "h-5 w-5",
	lg: "h-6 w-6",
} as const;

const spinnerSizes = {
	...iconSizes,
	xl: "h-8 w-8",
} as const;

const dotIconSizes = {
	xs: "h-1.5 w-1.5",
	sm: "h-2 w-2",
	md: "h-2.5 w-2.5",
	lg: "h-3 w-3",
} as const;

export const iconVariants = cva("", {
	variants: {
		size: iconSizes,
	},
	defaultVariants: {
		size: "sm",
	},
});

export const spinnerVariants = cva("animate-spin", {
	variants: {
		size: spinnerSizes,
	},
	defaultVariants: {
		size: "sm",
	},
});

export const dotIconVariants = cva("", {
	variants: {
		size: dotIconSizes,
	},
	defaultVariants: {
		size: "sm",
	},
});
