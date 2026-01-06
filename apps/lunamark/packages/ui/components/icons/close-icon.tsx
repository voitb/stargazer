import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const closeIconVariants = cva("", {
	variants: {
		size: {
			xs: "h-3 w-3",
			sm: "h-4 w-4",
			md: "h-5 w-5",
			lg: "h-6 w-6",
		},
	},
	defaultVariants: {
		size: "sm",
	},
});

type CloseIconProps = Omit<ComponentProps<"svg">, "children"> &
	VariantProps<typeof closeIconVariants>;

function CloseIcon({ size, className, ref, ...props }: CloseIconProps) {
	return (
		<svg
			ref={ref}
			className={cn(closeIconVariants({ size }), className)}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
}

export { CloseIcon, closeIconVariants };
export type { CloseIconProps };
