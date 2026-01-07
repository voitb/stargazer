import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { dotIconVariants } from "./icon.variants";

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

export { DotIcon };
export type { DotIconProps };
