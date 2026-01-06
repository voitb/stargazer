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

	const contextValue: DropdownContextValue = useMemo(
		() => ({
			isOpen: dropdown.isOpen,
			setIsOpen: dropdown.setIsOpen,
			trigger,
			activeIndex: dropdown.activeIndex,
			setActiveIndex: dropdown.setActiveIndex,
			selectedIndex: dropdown.selectedIndex,
			getItemProps: dropdown.getItemProps,
			getReferenceProps: dropdown.getReferenceProps,
			getFloatingProps: dropdown.getFloatingProps,
			refs: dropdown.refs,
			floatingStyles: dropdown.floatingStyles,
			placement: dropdown.placement,
			contentId: dropdown.contentId,
			listRef: dropdown.listRef,
			labelsRef: dropdown.labelsRef,
			floatingContext: dropdown.floatingContext,
		}),
		[dropdown, trigger]
	);

	return (
		<DropdownContext.Provider value={contextValue}>
			{children}
		</DropdownContext.Provider>
	);
}

export { Dropdown };
