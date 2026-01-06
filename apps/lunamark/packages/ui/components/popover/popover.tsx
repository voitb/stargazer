"use client";

import { useMemo, type ReactNode } from "react";
import type { Placement } from "@floating-ui/react";
import { PopoverContext, type PopoverContextValue } from "./popover.context";
import { usePopover } from "./use-popover";

export type PopoverProps = {
	trigger?: "hover" | "click";
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement;
	sideOffset?: number;
	children: ReactNode;
};

function Popover({
	trigger = "click",
	open,
	onOpenChange,
	placement = "bottom",
	sideOffset = 8,
	children,
}: PopoverProps) {
	const popover = usePopover({
		open,
		onOpenChange,
		placement,
		sideOffset,
		trigger,
	});

	const contextValue: PopoverContextValue = useMemo(
		() => ({
			isOpen: popover.isOpen,
			setIsOpen: popover.setIsOpen,
			trigger,
			getReferenceProps: popover.getReferenceProps,
			getFloatingProps: popover.getFloatingProps,
			refs: popover.refs,
			floatingStyles: popover.floatingStyles,
			placement: popover.placement,
			contentId: popover.contentId,
			floatingContext: popover.floatingContext,
			shouldRender: popover.shouldRender,
			dataState: popover.dataState,
		}),
		[popover, trigger]
	);

	return (
		<PopoverContext.Provider value={contextValue}>
			{children}
		</PopoverContext.Provider>
	);
}

export { Popover };
