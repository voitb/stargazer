"use client";

import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { useExitAnimation } from "@ui/hooks/animation/use-exit-animation";
import { cn } from "../../utils/cn";
import { useTooltipContext } from "./tooltip.context";
import { tooltipContentVariants } from "./tooltip.variants";

export type TooltipContentProps = {
	children: ReactNode;
	className?: string;
} & VariantProps<typeof tooltipContentVariants>;

export function TooltipContent({
	children,
	className,
	variant,
}: TooltipContentProps) {
	const { isOpen, refs, floatingStyles, getFloatingProps, contentId, placement } =
		useTooltipContext("TooltipContent");

	const shouldRender = useExitAnimation(isOpen, 150);

	if (!shouldRender) return null;

	const side = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
	const dataState = isOpen ? "open" : "closed";

	return (
		<FloatingPortal>
			<div
				ref={refs.setFloating}
				id={contentId}
				role="tooltip"
				style={floatingStyles}
				data-state={dataState}
				data-side={side}
				data-floating-content
				data-tooltip-content
				className={cn(tooltipContentVariants({ variant, className }))}
				{...getFloatingProps()}
			>
				{children}
			</div>
		</FloatingPortal>
	);
}
