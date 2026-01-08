"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { FloatingPortal, FloatingFocusManager } from "@floating-ui/react";
import { cn } from "@ui/utils";
import { usePopoverContext } from "./popover.context";
import { popoverContentVariants } from "./popover.variants";

export type PopoverContentProps = {
	children: ReactNode;
	className?: string;
} & Omit<
	ComponentProps<"div">,
	"children" | "className" | "style" | "id" | "role"
> &
	VariantProps<typeof popoverContentVariants>;

function PopoverContent({
	children,
	className,
	...props
}: PopoverContentProps) {
	const {
		isOpen,
		refs,
		floatingStyles,
		getFloatingProps,
		placement,
		contentId,
		trigger,
		floatingContext,
		shouldRender,
		dataState,
	} = usePopoverContext("PopoverContent");

	const side = placement.split("-")[0] as "top" | "bottom" | "left" | "right";

	if (!shouldRender) return null;

	const content = (
		<div
			id={contentId}
			ref={refs.setFloating}
			role="dialog"
			data-floating-content
			data-popover-content
			data-state={dataState}
			data-side={side}
			style={floatingStyles}
			className={cn(popoverContentVariants(), className)}
			{...getFloatingProps()}
			{...props}
		>
			{children}
		</div>
	);

	return (
		<FloatingPortal>
			{trigger === "click" ? (
				<FloatingFocusManager
					context={floatingContext}
					modal={false}
					initialFocus={-1}
				>
					{content}
				</FloatingFocusManager>
			) : (
				content
			)}
		</FloatingPortal>
	);
}

export { PopoverContent };
