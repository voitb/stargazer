import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const checkIconVariants = cva("", {
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

type CheckIconProps = Omit<ComponentProps<"svg">, "children"> &
	VariantProps<typeof checkIconVariants>;

function CheckIcon({ size, className, ref, ...props }: CheckIconProps) {
	return (
		<svg
			ref={ref}
			className={cn(checkIconVariants({ size }), className)}
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
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

export { CheckIcon, checkIconVariants };
export type { CheckIconProps };
