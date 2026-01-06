import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const dotIconVariants = cva("", {
	variants: {
		size: {
			xs: "h-1.5 w-1.5",
			sm: "h-2 w-2",
			md: "h-2.5 w-2.5",
			lg: "h-3 w-3",
		},
	},
	defaultVariants: {
		size: "sm",
	},
});

type DotIconProps = Omit<ComponentProps<"svg">, "children"> &
	VariantProps<typeof dotIconVariants>;

function DotIcon({ size, className, ref, ...props }: DotIconProps) {
	return (
		<svg
			ref={ref}
			className={cn(dotIconVariants({ size }), className)}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			{...props}
		>
			<circle cx="12" cy="12" r="6" />
		</svg>
	);
}

export { DotIcon, dotIconVariants };
export type { DotIconProps };
