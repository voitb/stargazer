import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@ui/utils";
import { iconVariants } from "./icon.variants";

type CloseIconProps = Omit<ComponentProps<"svg">, "children"> &
	VariantProps<typeof iconVariants>;

function CloseIcon({ size, className, ref, ...props }: CloseIconProps) {
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
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
}

export { CloseIcon };
export type { CloseIconProps };
