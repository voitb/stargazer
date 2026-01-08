"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@ui/utils";
import { dialogFooterVariants } from "./dialog.variants";

export type DialogFooterProps = ComponentProps<"div"> &
	VariantProps<typeof dialogFooterVariants>;

export function DialogFooter({ className, ref, ...props }: DialogFooterProps) {
	return (
		<div
			ref={ref}
			className={cn(dialogFooterVariants(), className)}
			{...props}
		/>
	);
}
