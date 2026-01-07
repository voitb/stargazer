"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { mergeRefs } from "../../utils/merge-refs";
import { DialogClose } from "./dialog-close";
import { useDialogContext } from "./dialog.context";
import {
	dialogContentVariants,
	dialogOverlayVariants,
} from "./dialog.variants";

export type DialogContentProps = ComponentProps<"div"> &
	VariantProps<typeof dialogContentVariants>;

export function DialogContent({
	className,
	size,
	children,
	ref,
	...props
}: DialogContentProps) {
	const {
		titleId,
		descriptionId,
		contentRef,
		shouldRender,
		handleBackdropClick,
		dataState,
	} = useDialogContext("DialogContent");

	const combinedRef = mergeRefs(contentRef, ref);

	if (!shouldRender) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			data-state={dataState}
			onClick={handleBackdropClick}
		>
			<div
				data-dialog-overlay
				data-state={dataState}
				className={cn(dialogOverlayVariants())}
				aria-hidden="true"
			/>

			<div
				ref={combinedRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				data-dialog-content
				data-state={dataState}
				className={cn(dialogContentVariants({ size }), className)}
				{...props}
			>
				{children}
				<DialogClose />
			</div>
		</div>,
		document.body
	);
}
