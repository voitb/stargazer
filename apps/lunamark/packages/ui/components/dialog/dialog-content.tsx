"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { DialogClose } from "./dialog-close";
import { useDialogContext } from "./dialog.context";
import {
	dialogContentVariants,
	dialogOverlayVariants,
} from "./dialog.variants";
import { useDialog } from "./use-dialog";

export type DialogContentProps = ComponentProps<"div"> &
	VariantProps<typeof dialogContentVariants>;

export function DialogContent({
	className,
	size,
	children,
	ref,
	...props
}: DialogContentProps) {
	const { open, onOpenChange, closeOnBackdropClick, titleId, descriptionId } =
		useDialogContext("DialogContent");

	const { contentRef, shouldRender, handleBackdropClick, dataState } =
		useDialog({
			open,
			onOpenChange,
			closeOnBackdropClick,
		});

	const combinedRef = (node: HTMLDivElement | null) => {
		contentRef.current = node;
		if (typeof ref === "function") {
			ref(node);
		} else if (ref) {
			ref.current = node;
		}
	};

	if (!shouldRender) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			data-state={dataState}
			onClick={handleBackdropClick}
		>
			{/* Overlay */}
			<div
				data-dialog-overlay
				data-state={dataState}
				className={cn(dialogOverlayVariants())}
				aria-hidden="true"
			/>

			{/* Content */}
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
