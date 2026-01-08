"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@ui/utils";
import { CloseIcon } from "../icons";
import { usePopoverContext } from "./popover.context";

export type PopoverCloseProps = {
	children?: ReactNode;
	className?: string;
} & Omit<ComponentProps<"button">, "children" | "className" | "type" | "onClick">;

function PopoverClose({ children, className, ...props }: PopoverCloseProps) {
	const { setIsOpen } = usePopoverContext("PopoverClose");

	return (
		<button
			type="button"
			onClick={() => setIsOpen(false)}
			className={cn(
				"absolute right-2 top-2 rounded-sm opacity-70 transition-opacity",
				"hover:opacity-100",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
				className
			)}
			aria-label="Close"
			{...props}
		>
			{children || <CloseIcon />}
		</button>
	);
}

export { PopoverClose };
