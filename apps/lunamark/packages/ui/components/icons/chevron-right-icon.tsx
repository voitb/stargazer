import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { iconVariants } from "./icon.variants";

type ChevronRightIconProps = Omit<ComponentProps<"svg">, "children"> &
	VariantProps<typeof iconVariants>;

function ChevronRightIcon({
	size,
	className,
	ref,
	...props
}: ChevronRightIconProps) {
	return (
		<svg
			ref={ref}
			className={cn(iconVariants({ size }), className)}
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

export { ChevronRightIcon };
export type { ChevronRightIconProps };
