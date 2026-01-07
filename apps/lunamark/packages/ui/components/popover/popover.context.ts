"use client";

import { createContext, useContext } from "react";
import type { FloatingContext, Placement } from "@floating-ui/react";

export type PopoverContextValue = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;

	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	floatingContext: FloatingContext;
	placement: Placement;

	getReferenceProps: () => Record<string, unknown>;
	getFloatingProps: () => Record<string, unknown>;

	shouldRender: boolean;
	dataState: "open" | "closed";

	contentId: string;

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
