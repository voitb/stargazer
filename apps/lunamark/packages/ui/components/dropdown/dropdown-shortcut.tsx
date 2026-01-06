"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { dropdownShortcutVariants } from "./dropdown.variants";

export type DropdownShortcutProps = {
	children: ReactNode;
	className?: string;
} & Omit<ComponentProps<"span">, "children" | "className">;

function DropdownShortcut({
	children,
	className,
	...props
}: DropdownShortcutProps) {
	return (
		<span className={cn(dropdownShortcutVariants(), className)} {...props}>
			{children}
		</span>
	);
}

export { DropdownShortcut };
