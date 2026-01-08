"use client";

import type { ComponentProps } from "react";
import { cn } from "@ui/utils";
import { CloseIcon } from "../icons";
import { useDialogContext } from "./dialog.context";

export type DialogCloseProps = Omit<ComponentProps<"button">, "onClick">;

export function DialogClose({ className, children, ref, ...props }: DialogCloseProps) {
	const { open, onOpenChange } = useDialogContext("DialogClose");

	return (
		<button
			ref={ref}
			type="button"
			tabIndex={open ? 0 : -1}
			className={cn(
				"absolute right-4 top-4 rounded-sm opacity-70 transition-opacity",
				"hover:opacity-100",
				"focus-visible:outline-none focus-visible:ring-2",
				"focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
				"disabled:pointer-events-none",
				className
			)}
			onClick={() => onOpenChange(false)}
			aria-label="Close"
			{...props}
		>
			{children ?? <CloseIcon />}
		</button>
	);
}
