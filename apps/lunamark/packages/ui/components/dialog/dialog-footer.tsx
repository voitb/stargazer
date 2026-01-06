"use client";

import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { dialogFooterVariants } from "./dialog.variants";

export type DialogFooterProps = ComponentProps<"div">;

export function DialogFooter({ className, ref, ...props }: DialogFooterProps) {
	return (
		<div
			ref={ref}
			className={cn(dialogFooterVariants(), className)}
			{...props}
		/>
	);
}
