"use client";

import { createContext, useContext } from "react";
import type { FloatingContext, Placement } from "@floating-ui/react";

export type TooltipContextValue = {
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
	contentId: string;
};

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltipContext(componentName: string): TooltipContextValue {
	const context = useContext(TooltipContext);
	if (!context) {
		throw new Error(
			`<${componentName}> must be used within a <Tooltip> provider`
		);
	}
	return context;
}
