"use client";

import {
	autoUpdate,
	flip,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useListNavigation,
	useRole,
} from "@floating-ui/react";
import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state";

export interface MultiSelectChipsOption {
	value: string;
	label?: string;
}

export interface UseMultiSelectChipsOptions {
	values?: string[];
	onValuesChange?: (values: string[]) => void;
	onToggle?: (value: string) => void;
	options: MultiSelectChipsOption[];
	maxDisplay?: number;
}

export interface UseMultiSelectChipsReturn {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	values: string[];
	activeIndex: number | null;
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: CSSProperties;
	context: ReturnType<typeof useFloating>["context"];
	listRef: React.MutableRefObject<(HTMLButtonElement | null)[]>;
	getReferenceProps: () => Record<string, unknown>;
	getFloatingProps: () => Record<string, unknown>;
	getItemProps: (
		userProps?: React.HTMLProps<HTMLElement>,
	) => Record<string, unknown>;
	handleToggle: (value: string) => void;
	handleClearAll: () => void;
	selectedOptions: MultiSelectChipsOption[];
	visibleUnselected: MultiSelectChipsOption[];
	overflowOptions: MultiSelectChipsOption[];
	hasSelection: boolean;
	hasOverflow: boolean;
}

export function useMultiSelectChips({
	values: controlledValues,
	onValuesChange,
	onToggle,
	options,
	maxDisplay = 6,
}: UseMultiSelectChipsOptions): UseMultiSelectChipsReturn {
	const [values, setValues] = useControllableState({
		value: controlledValues,
		defaultValue: [],
		onChange: onValuesChange,
	});

	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const listRef = useRef<(HTMLButtonElement | null)[]>([]);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: "bottom-start",
		middleware: [offset(4), flip(), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate,
	});

	const click = useClick(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "listbox" });
	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		onNavigate: setActiveIndex,
		loop: true,
	});

	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
		[click, dismiss, role, listNavigation],
	);

	const selectedOptions = options.filter((o) => values.includes(o.value));
	const unselectedOptions = options.filter((o) => !values.includes(o.value));
	const remainingSlots = Math.max(0, maxDisplay - selectedOptions.length);
	const visibleUnselected = unselectedOptions.slice(0, remainingSlots);
	const overflowOptions = unselectedOptions.slice(remainingSlots);

	const hasSelection = values.length > 0;
	const hasOverflow = overflowOptions.length > 0;

	const handleToggle = (value: string) => {
		const newValues = values.includes(value)
			? values.filter((v) => v !== value)
			: [...values, value];
		setValues(newValues);
		onToggle?.(value);
	};

	const handleClearAll = () => setValues([]);

	return {
		isOpen,
		setIsOpen,
		values,
		activeIndex,
		refs,
		floatingStyles,
		context,
		listRef,
		getReferenceProps,
		getFloatingProps,
		getItemProps,
		handleToggle,
		handleClearAll,
		selectedOptions,
		visibleUnselected,
		overflowOptions,
		hasSelection,
		hasOverflow,
	};
}
