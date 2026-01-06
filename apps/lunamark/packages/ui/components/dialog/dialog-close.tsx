"use client";

import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { useDialogContext } from "./dialog.context";
import { dialogCloseVariants } from "./dialog.variants";

export type DialogCloseProps = Omit<ComponentProps<"button">, "onClick">;

export function DialogClose({ className, children, ref, ...props }: DialogCloseProps) {
	const { open, onOpenChange } = useDialogContext("DialogClose");

	return (
		<button
			ref={ref}
			type="button"
			tabIndex={open ? 0 : -1}
			className={cn(dialogCloseVariants(), className)}
			onClick={() => onOpenChange(false)}
			aria-label="Close"
			{...props}
		>
			{children ?? <CloseIcon />}
		</button>
	);
}

export function CloseIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
}
