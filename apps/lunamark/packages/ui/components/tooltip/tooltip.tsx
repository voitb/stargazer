"use client";

import { useMemo, type ReactNode } from "react";
import type { Placement } from "@floating-ui/react";
import { TooltipContext } from "./tooltip.context";
import { useTooltip } from "./use-tooltip";

export type TooltipProps = {
	children: ReactNode;
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement;
	delayDuration?: number;
	sideOffset?: number;
};

export function Tooltip({
	children,
	defaultOpen,
	open,
	onOpenChange,
	placement = "top",
	delayDuration = 300,
	sideOffset = 8,
}: TooltipProps) {
	const tooltip = useTooltip({
		defaultOpen,
		open,
		onOpenChange,
		placement,
		delayDuration,
		sideOffset,
	});

	const {
		isOpen,
		setIsOpen,
		refs,
		floatingStyles,
		floatingContext,
		placement: actualPlacement,
		getReferenceProps,
		getFloatingProps,
		contentId,
	} = tooltip;

	const contextValue = useMemo(
		() => ({
			isOpen,
			setIsOpen,
			refs,
			floatingStyles,
			floatingContext,
			placement: actualPlacement,
			getReferenceProps,
			getFloatingProps,
			contentId,
		}),
		[
			isOpen,
			setIsOpen,
			refs,
			floatingStyles,
			floatingContext,
			actualPlacement,
			getReferenceProps,
			getFloatingProps,
			contentId,
		]
	);

	return (
		<TooltipContext.Provider value={contextValue}>
			{children}
		</TooltipContext.Provider>
	);
}
