"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import type { ToggleGroupContextValue } from "./toggle-group.context";

// Single selection mode props
type SingleSelectionOptions = {
	type: "single";
	value: string | null;
	onValueChange: (value: string | null) => void;
};

// Multiple selection mode props
type MultipleSelectionOptions = {
	type: "multiple";
	values: string[];
	onValuesChange: (values: string[]) => void;
};

// Base options shared by both modes
type BaseOptions = {
	size?: "sm" | "md" | "lg";
	variant?: "ring" | "contained";
	orientation?: "horizontal" | "vertical";
};

export type UseToggleGroupOptions = BaseOptions &
	(SingleSelectionOptions | MultipleSelectionOptions);

export type UseToggleGroupReturn = {
	// Context value to pass to provider
	contextValue: ToggleGroupContextValue;

	// Keyboard handler for the container
	handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;

	// Computed props for the container element
	containerProps: {
		role: "radiogroup" | "toolbar";
		onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
	};
};

export function useToggleGroup(
	options: UseToggleGroupOptions
): UseToggleGroupReturn {
	const {
		type,
		size = "md",
		variant = "ring",
		orientation = "horizontal",
	} = options;

	// Item registration for keyboard navigation
	const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

	// Extract values based on mode
	const isSingle = type === "single";
	const value = isSingle ? (options as SingleSelectionOptions).value : null;
	const values = !isSingle
		? (options as MultipleSelectionOptions).values
		: [];
	const onValueChange = isSingle
		? (options as SingleSelectionOptions).onValueChange
		: undefined;
	const onValuesChange = !isSingle
		? (options as MultipleSelectionOptions).onValuesChange
		: undefined;

	// Item registration callbacks
	const registerItem = useCallback(
		(itemValue: string, element: HTMLButtonElement) => {
			itemsRef.current.set(itemValue, element);
		},
		[]
	);

	const unregisterItem = useCallback((itemValue: string) => {
		itemsRef.current.delete(itemValue);
	}, []);

	// Selection state helpers
	const isItemSelected = useCallback(
		(itemValue: string) => {
			if (isSingle) {
				return value === itemValue;
			}
			return values.includes(itemValue);
		},
		[isSingle, value, values]
	);

	// Toggle handler
	const onItemToggle = useCallback(
		(itemValue: string) => {
			if (isSingle && onValueChange) {
				onValueChange(value === itemValue ? null : itemValue);
			} else if (!isSingle && onValuesChange) {
				const newValues = values.includes(itemValue)
					? values.filter((v) => v !== itemValue)
					: [...values, itemValue];
				onValuesChange(newValues);
			}
		},
		[isSingle, value, values, onValueChange, onValuesChange]
	);

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			const items = Array.from(itemsRef.current.values());
			const currentIndex = items.findIndex(
				(el) => el === document.activeElement
			);

			if (currentIndex === -1) return;

			const isHorizontal = orientation === "horizontal";
			let nextIndex: number | null = null;

			switch (event.key) {
				case "ArrowRight":
					if (isHorizontal) {
						nextIndex = (currentIndex + 1) % items.length;
					}
					break;
				case "ArrowLeft":
					if (isHorizontal) {
						nextIndex =
							currentIndex === 0 ? items.length - 1 : currentIndex - 1;
					}
					break;
				case "ArrowDown":
					if (!isHorizontal) {
						nextIndex = (currentIndex + 1) % items.length;
					}
					break;
				case "ArrowUp":
					if (!isHorizontal) {
						nextIndex =
							currentIndex === 0 ? items.length - 1 : currentIndex - 1;
					}
					break;
				case "Home":
					nextIndex = 0;
					break;
				case "End":
					nextIndex = items.length - 1;
					break;
			}

			if (nextIndex !== null) {
				event.preventDefault();
				items[nextIndex]?.focus();
			}
		},
		[orientation]
	);

	// Build context value
	const contextValue: ToggleGroupContextValue = {
		type,
		value,
		values,
		onItemToggle,
		size,
		variant,
		orientation,
		registerItem,
		unregisterItem,
		isItemSelected,
	};

	// Container props
	const containerProps = {
		role: (type === "single" ? "radiogroup" : "toolbar") as
			| "radiogroup"
			| "toolbar",
		onKeyDown: handleKeyDown,
	};

	return {
		contextValue,
		handleKeyDown,
		containerProps,
	};
}
