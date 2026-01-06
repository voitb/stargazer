"use client";

import { createContext, useContext } from "react";
import type { FloatingContext, Placement } from "@floating-ui/react";

/**
 * Main popover context - shared between all popover components
 */
export type PopoverContextValue = {
	// State
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;

	// Floating UI integration
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	floatingContext: FloatingContext;
	placement: Placement;

	// Interaction prop getters
	getReferenceProps: () => Record<string, unknown>;
	getFloatingProps: () => Record<string, unknown>;

	// Behavior
	shouldRender: boolean;
	dataState: "open" | "closed";

	// IDs
	contentId: string;

	// Options
	trigger: "hover" | "click";
};

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(componentName: string): PopoverContextValue {
	const context = useContext(PopoverContext);
	if (!context) {
		throw new Error(
			`<${componentName}> must be used within a <Popover> provider`
		);
	}
	return context;
}
