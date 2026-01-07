import { cva } from "class-variance-authority";

export const formFieldVariants = cva("", {
	variants: {
		layout: {
			vertical: "space-y-1.5",
			horizontal: "flex flex-row items-center space-x-3 space-y-0",
			compact: "space-y-1",
		},
		size: {
			sm: "space-y-1",
			md: "space-y-1.5",
			lg: "space-y-2",
		},
	},
	defaultVariants: {
		layout: "vertical",
		size: "md",
	},
});
