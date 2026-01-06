"use client";

import { createContext, useContext } from "react";

/**
 * Context value shared between ToggleGroup and ToggleGroupItem components
 */
export type ToggleGroupContextValue = {
	// Selection mode
	type: "single" | "multiple";

	// State
	value: string | null;
	values: string[];

	// Callbacks
	onItemToggle: (itemValue: string) => void;
	isItemSelected: (itemValue: string) => boolean;

	// Item registration for keyboard navigation
	registerItem: (value: string, element: HTMLButtonElement) => void;
	unregisterItem: (value: string) => void;

	// Styling
	size: "sm" | "md" | "lg";
	variant: "ring" | "contained";
	orientation: "horizontal" | "vertical";
};

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(
	null
);

export function useToggleGroupContext(): ToggleGroupContextValue {
	const context = useContext(ToggleGroupContext);
	if (!context) {
		throw new Error(
			"ToggleGroupItem must be used within a ToggleGroup provider"
		);
	}
	return context;
}
