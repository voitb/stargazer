import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const chevronRightIconVariants = cva("", {
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

type ChevronRightIconProps = Omit<ComponentProps<"svg">, "children"> &
	VariantProps<typeof chevronRightIconVariants>;

function ChevronRightIcon({
	size,
	className,
	ref,
	...props
}: ChevronRightIconProps) {
	return (
		<svg
			ref={ref}
			className={cn(chevronRightIconVariants({ size }), className)}
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
			<polyline points="9 18 15 12 9 6" />
		</svg>
	);
}

export { ChevronRightIcon, chevronRightIconVariants };
export type { ChevronRightIconProps };
