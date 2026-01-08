"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@ui/utils";
import { useDialogContext } from "./dialog.context";
import {
	dialogDescriptionVariants,
	dialogHeaderVariants,
	dialogTitleVariants,
} from "./dialog.variants";

export type DialogHeaderProps = ComponentProps<"div"> &
	VariantProps<typeof dialogHeaderVariants>;

export function DialogHeader({ className, ref, ...props }: DialogHeaderProps) {
	return (
		<div
			ref={ref}
			className={cn(dialogHeaderVariants(), className)}
			{...props}
		/>
	);
}

export type DialogTitleProps = ComponentProps<"h2"> &
	VariantProps<typeof dialogTitleVariants>;

export function DialogTitle({ className, ref, ...props }: DialogTitleProps) {
	const { titleId } = useDialogContext("DialogTitle");

	return (
		<h2
			id={titleId}
			ref={ref}
			className={cn(dialogTitleVariants(), className)}
			{...props}
		/>
	);
}

export type DialogDescriptionProps = ComponentProps<"p"> &
	VariantProps<typeof dialogDescriptionVariants>;

export function DialogDescription({
	className,
	ref,
	...props
}: DialogDescriptionProps) {
	const { descriptionId } = useDialogContext("DialogDescription");

	return (
		<p
			id={descriptionId}
			ref={ref}
			className={cn(dialogDescriptionVariants(), className)}
			{...props}
		/>
	);
}
