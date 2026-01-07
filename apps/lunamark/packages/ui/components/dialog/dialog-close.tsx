"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { CloseIcon } from "../icons";
import { useDialogContext } from "./dialog.context";
import { dialogCloseVariants } from "./dialog.variants";

export type DialogCloseProps = Omit<ComponentProps<"button">, "onClick"> &
	VariantProps<typeof dialogCloseVariants>;

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
