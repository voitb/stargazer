"use client";

import type { VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";
import {
	toggleGroupItemVariants,
	toggleGroupVariants,
} from "./toggle-group.variants";

type ToggleGroupVariantProps = VariantProps<typeof toggleGroupVariants>;
type ToggleGroupItemVariantProps = VariantProps<typeof toggleGroupItemVariants>;

export type ToggleGroupContextValue = {
	type: "single" | "multiple";
	value: string | null;
	values: string[];
	onItemToggle: (itemValue: string) => void;
	isItemSelected: (itemValue: string) => boolean;

	registerItem: (value: string, element: HTMLButtonElement) => void;
	unregisterItem: (value: string) => void;

	size: ToggleGroupItemVariantProps["size"];
	variant: ToggleGroupVariantProps["variant"];
	orientation: ToggleGroupVariantProps["orientation"];
};

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(
	null
);

export function useToggleGroupContext(
	componentName: string
): ToggleGroupContextValue {
	const context = useContext(ToggleGroupContext);
	if (!context) {
		throw new Error(
			`<${componentName}> must be used within a <ToggleGroup> provider`
		);
	}
	return context;
}
