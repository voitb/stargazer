"use client";

import type { ComponentProps } from "react";
import { cn } from "@ui/utils";

export type DropdownSeparatorProps = {
	className?: string;
} & Omit<ComponentProps<"div">, "className" | "role">;

function DropdownSeparator({ className, ...props }: DropdownSeparatorProps) {
	return (
		<div
			role="separator"
			className={cn(
				"-mx-1 my-1 h-px bg-[rgb(var(--color-neutral-stroke-1))]",
				className
			)}
			{...props}
		/>
	);
}

export { DropdownSeparator };
