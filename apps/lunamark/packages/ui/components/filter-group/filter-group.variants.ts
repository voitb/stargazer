import { cva } from "class-variance-authority";

export const filterGroupVariants = cva("flex items-center", {
	variants: {
		size: {
			sm: "gap-2",
			md: "gap-3",
			lg: "gap-4",
		},
		variant: {
			default: "",
			compact: "gap-2",
		},
	},
	defaultVariants: {
		size: "md",
		variant: "default",
	},
});
