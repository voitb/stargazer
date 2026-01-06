"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { dropdownLabelVariants } from "./dropdown.variants";

export type DropdownLabelProps = {
	children: ReactNode;
	inset?: boolean;
	className?: string;
} & Omit<ComponentProps<"div">, "children" | "className">;

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
