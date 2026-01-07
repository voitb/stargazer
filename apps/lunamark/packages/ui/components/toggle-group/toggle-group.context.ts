"use client";

import { createContext, useContext } from "react";

export type ToggleGroupContextValue = {
	type: "single" | "multiple";
	value: string | null;
	values: string[];
	onItemToggle: (itemValue: string) => void;
	isItemSelected: (itemValue: string) => boolean;

	registerItem: (value: string, element: HTMLButtonElement) => void;
	unregisterItem: (value: string) => void;

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
