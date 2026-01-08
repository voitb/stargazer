"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@ui/utils";
import { dropdownLabelVariants } from "./dropdown.variants";

export type DropdownLabelProps = {
	children: ReactNode;
	className?: string;
} & Omit<ComponentProps<"div">, "children" | "className"> &
	VariantProps<typeof dropdownLabelVariants>;

function DropdownLabel({
	children,
	inset = false,
	className,
	...props
}: DropdownLabelProps) {
	return (
		<div
			className={cn(dropdownLabelVariants({ inset }), className)}
			{...props}
		>
			{children}
		</div>
	);
}

export { DropdownLabel };
