"use client";

import type { ComponentProps } from "react";
import { cn } from "@ui/utils";

export type DialogFooterProps = ComponentProps<"div">;

export function DialogFooter({ className, ref, ...props }: DialogFooterProps) {
	return (
		<div
			ref={ref}
			className={cn(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				className
			)}
			{...props}
		/>
	);
}
