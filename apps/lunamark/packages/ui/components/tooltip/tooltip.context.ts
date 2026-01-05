"use client";

import { createContext, useContext } from "react";
import type { Placement } from "@floating-ui/react";

type TooltipContextValue = {
	isOpen: boolean;
	getReferenceProps: () => Record<string, unknown>;
	getFloatingProps: () => Record<string, unknown>;
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	placement: Placement;
	contentId: string;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
	const context = useContext(TooltipContext);
	if (!context) {
		throw new Error("Tooltip components must be used within a Tooltip provider");
	}
	return context;
}

export { TooltipContext, useTooltipContext };
export type { TooltipContextValue };
