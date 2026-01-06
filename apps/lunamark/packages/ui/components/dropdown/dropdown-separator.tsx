"use client";

import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { dropdownSeparatorVariants } from "./dropdown.variants";

export type DropdownSeparatorProps = {
	className?: string;
} & Omit<ComponentProps<"div">, "className" | "role">;

function DropdownSeparator({ className, ...props }: DropdownSeparatorProps) {
	return (
		<div
			role="separator"
			className={cn(dropdownSeparatorVariants(), className)}
			{...props}
		/>
	);
}

export { DropdownSeparator };
