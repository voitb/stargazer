"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { CloseIcon } from "../icons";
import { usePopoverContext } from "./popover.context";
import { popoverCloseVariants } from "./popover.variants";

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
			className={cn(popoverCloseVariants(), className)}
			aria-label="Close"
			{...props}
		>
			{children || <CloseIcon />}
		</button>
	);
}

export { PopoverClose };
