"use client";

import type { VariantProps } from "class-variance-authority";
import { useCallback, useMemo, useRef, type KeyboardEvent } from "react";
import type { ToggleGroupContextValue } from "./toggle-group.context";
import {
	toggleGroupItemVariants,
	toggleGroupVariants,
} from "./toggle-group.variants";

type SingleSelectionOptions = {
	type: "single";
	value: string | null;
	onValueChange: (value: string | null) => void;
};

type MultipleSelectionOptions = {
	type: "multiple";
	values: string[];
	onValuesChange: (values: string[]) => void;
};

type ToggleGroupVariantProps = VariantProps<typeof toggleGroupVariants>;
type ToggleGroupItemVariantProps = VariantProps<typeof toggleGroupItemVariants>;

type BaseOptions = {
	size?: ToggleGroupItemVariantProps["size"];
	variant?: ToggleGroupVariantProps["variant"];
	orientation?: ToggleGroupVariantProps["orientation"];
};

export type UseToggleGroupOptions = BaseOptions &
	(SingleSelectionOptions | MultipleSelectionOptions);

export type UseToggleGroupReturn = {
	contextValue: ToggleGroupContextValue;

	handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;

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

	const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

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

	const registerItem = useCallback(
		(itemValue: string, element: HTMLButtonElement) => {
			itemsRef.current.set(itemValue, element);
		},
		[]
	);

	const unregisterItem = useCallback((itemValue: string) => {
		itemsRef.current.delete(itemValue);
	}, []);

	const isItemSelected = useCallback(
		(itemValue: string) => {
			if (isSingle) {
				return value === itemValue;
			}
			return values.includes(itemValue);
		},
		[isSingle, value, values]
	);

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

	const contextValue: ToggleGroupContextValue = useMemo(
		() => ({
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
		}),
		[
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
		]
	);

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
