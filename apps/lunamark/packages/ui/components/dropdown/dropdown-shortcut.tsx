"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@ui/utils";

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
		<span
			className={cn(
				"ml-auto text-xs tracking-widest text-[rgb(var(--color-neutral-foreground-2))]",
				className
			)}
			{...props}
		>
			{children}
		</span>
	);
}

export { DropdownShortcut };
