"use client";

import type { ComponentProps, ReactNode } from "react";
import { FloatingPortal, FloatingFocusManager } from "@floating-ui/react";
import { cn, mergeRefs } from "@ui/utils";
import { usePopoverContext } from "./popover.context";

export type PopoverContentProps = {
	children: ReactNode;
	className?: string;
} & Omit<
	ComponentProps<"div">,
	"children" | "className" | "style" | "id" | "role"
>;

function PopoverContent({
	children,
	className,
	ref,
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
	const combinedRef = mergeRefs(refs.setFloating, ref);
	const floatingProps = getFloatingProps(props);

	if (!shouldRender) return null;

	const content = (
		<div
			id={contentId}
			ref={combinedRef}
			role="dialog"
			data-floating-content
			data-popover-content
			data-state={dataState}
			data-side={side}
			style={floatingStyles}
			className={cn(
				"z-50 w-72 rounded-lg border p-4 shadow-lg",
				"bg-[rgb(var(--color-neutral-background-1))]",
				"text-[rgb(var(--color-neutral-foreground-1))]",
				"border-[rgb(var(--color-neutral-stroke-1))]",
				className
			)}
			{...floatingProps}
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
