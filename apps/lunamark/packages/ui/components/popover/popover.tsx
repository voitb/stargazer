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

	const {
		isOpen,
		setIsOpen,
		getReferenceProps,
		getFloatingProps,
		refs,
		floatingStyles,
		placement: actualPlacement,
		contentId,
		floatingContext,
		shouldRender,
		dataState,
	} = popover;

	const contextValue: PopoverContextValue = useMemo(
		() => ({
			isOpen,
			setIsOpen,
			trigger,
			getReferenceProps,
			getFloatingProps,
			refs,
			floatingStyles,
			placement: actualPlacement,
			contentId,
			floatingContext,
			shouldRender,
			dataState,
		}),
		[
			isOpen,
			setIsOpen,
			trigger,
			getReferenceProps,
			getFloatingProps,
			refs,
			floatingStyles,
			actualPlacement,
			contentId,
			floatingContext,
			shouldRender,
			dataState,
		]
	);

	return (
		<PopoverContext.Provider value={contextValue}>
			{children}
		</PopoverContext.Provider>
	);
}

export { Popover };
