import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { iconVariants } from "./icon.variants";

type CheckIconProps = Omit<ComponentProps<"svg">, "children"> &
	VariantProps<typeof iconVariants>;

function CheckIcon({ size, className, ref, ...props }: CheckIconProps) {
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
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

export { CheckIcon };
export type { CheckIconProps };
