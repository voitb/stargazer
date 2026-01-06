"use client";

import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { useDialogContext } from "./dialog.context";
import {
	dialogDescriptionVariants,
	dialogHeaderVariants,
	dialogTitleVariants,
} from "./dialog.variants";

export type DialogHeaderProps = ComponentProps<"div">;

export function DialogHeader({ className, ref, ...props }: DialogHeaderProps) {
	return (
		<div
			ref={ref}
			className={cn(dialogHeaderVariants(), className)}
			{...props}
		/>
	);
}

export type DialogTitleProps = ComponentProps<"h2">;

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

export type DialogDescriptionProps = ComponentProps<"p">;

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
