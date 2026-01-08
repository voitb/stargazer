"use client";

import type { ComponentProps } from "react";
import { cn } from "@ui/utils";
import { useDialogContext } from "./dialog.context";

export type DialogHeaderProps = ComponentProps<"div">;

export function DialogHeader({ className, ref, ...props }: DialogHeaderProps) {
	return (
		<div
			ref={ref}
			className={cn(
				"flex flex-col space-y-1.5 text-center sm:text-left",
				className
			)}
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
			className={cn(
				"text-lg font-semibold leading-none tracking-tight",
				className
			)}
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
			className={cn(
				"text-sm text-[rgb(var(--color-neutral-foreground-1))]/70",
				className
			)}
			{...props}
		/>
	);
}
