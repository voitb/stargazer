"use client";

import { useMemo, type ReactNode } from "react";
import type { Placement } from "@floating-ui/react";
import { DropdownContext, type DropdownContextValue } from "./dropdown.context";
import { useDropdown } from "./use-dropdown";

export type DropdownProps = {
	trigger?: "hover" | "click";
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement;
	sideOffset?: number;
	children: ReactNode;
	modal?: boolean;
};

function Dropdown({
	trigger = "click",
	open,
	onOpenChange,
	placement = "bottom-start",
	sideOffset = 4,
	children,
	modal = false,
}: DropdownProps) {
	const dropdown = useDropdown({
		open,
		onOpenChange,
		placement,
		sideOffset,
		trigger,
		modal,
	});

	const {
		isOpen,
		setIsOpen,
		activeIndex,
		setActiveIndex,
		selectedIndex,
		getItemProps,
		getReferenceProps,
		getFloatingProps,
		refs,
		floatingStyles,
		placement: actualPlacement,
		contentId,
		listRef,
		labelsRef,
		floatingContext,
	} = dropdown;

	const contextValue: DropdownContextValue = useMemo(
		() => ({
			isOpen,
			setIsOpen,
			trigger,
			activeIndex,
			setActiveIndex,
			selectedIndex,
			getItemProps,
			getReferenceProps,
			getFloatingProps,
			refs,
			floatingStyles,
			placement: actualPlacement,
			contentId,
			listRef,
			labelsRef,
			floatingContext,
		}),
		[
			isOpen,
			setIsOpen,
			trigger,
			activeIndex,
			setActiveIndex,
			selectedIndex,
			getItemProps,
			getReferenceProps,
			getFloatingProps,
			refs,
			floatingStyles,
			actualPlacement,
			contentId,
			listRef,
			labelsRef,
			floatingContext,
		]
	);

	return (
		<DropdownContext.Provider value={contextValue}>
			{children}
		</DropdownContext.Provider>
	);
}

export { Dropdown };
