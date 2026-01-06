"use client";

import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useHover,
	useClick,
	useDismiss,
	useRole,
	useListNavigation,
	useInteractions,
	useTypeahead,
	type Placement,
	type FloatingContext,
} from "@floating-ui/react";
import { useCallback, useId, useRef, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useExitAnimation } from "../../hooks/use-exit-animation";

export type UseDropdownOptions = {
	// State
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;

	// Positioning
	placement?: Placement;
	sideOffset?: number;

	// Behavior
	trigger?: "hover" | "click";
	loop?: boolean;
	modal?: boolean;
};

export type UseDropdownReturn = {
	// State
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;

	// Navigation state
	activeIndex: number | null;
	setActiveIndex: (index: number | null) => void;
	selectedIndex: number | null;

	// Refs
	listRef: React.MutableRefObject<(HTMLElement | null)[]>;
	labelsRef: React.MutableRefObject<(string | null)[]>;

	// Floating UI returns
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
	getItemProps: (options: {
		active: boolean;
		onClick?: () => void;
	}) => Record<string, unknown>;

	// Behavior
	shouldRender: boolean;
	dataState: "open" | "closed";

	// IDs
	contentId: string;

	// Options passthrough
	trigger: "hover" | "click";
};

export function useDropdown(options: UseDropdownOptions = {}): UseDropdownReturn {
	const {
		defaultOpen = false,
		open: controlledOpen,
		onOpenChange,
		placement: requestedPlacement = "bottom-start",
		sideOffset = 4,
		trigger = "click",
		loop = true,
	} = options;

	// Navigation state
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const selectedIndex: number | null = null;

	// State management with controlled/uncontrolled support
	const [isOpen, setIsOpenBase] = useControllableState({
		value: controlledOpen,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	// Reset active index when closing
	const setIsOpen = useCallback(
		(nextOpen: boolean) => {
			setIsOpenBase(nextOpen);
			if (!nextOpen) {
				setActiveIndex(null);
			}
		},
		[setIsOpenBase]
	);

	// IDs for accessibility
	const contentId = useId();

	// Refs for list navigation
	const listRef = useRef<(HTMLElement | null)[]>([]);
	const labelsRef = useRef<(string | null)[]>([]);

	// Floating UI setup
	const {
		refs,
		floatingStyles,
		context,
		placement: actualPlacement,
	} = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: requestedPlacement,
		middleware: [
			offset(sideOffset),
			flip({ fallbackAxisSideDirection: "end" }),
			shift({ padding: 8 }),
		],
		whileElementsMounted: autoUpdate,
	});

	// Interaction hooks
	const hover = useHover(context, {
		enabled: trigger === "hover",
		move: false,
		delay: { open: 150, close: 200 },
	});

	const click = useClick(context, {
		enabled: trigger === "click",
	});

	const dismiss = useDismiss(context, {
		ancestorScroll: true,
	});

	const role = useRole(context, { role: "menu" });

	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		selectedIndex,
		onNavigate: setActiveIndex,
		loop,
	});

	const typeahead = useTypeahead(context, {
		listRef: labelsRef,
		activeIndex,
		selectedIndex,
		onMatch: isOpen ? setActiveIndex : undefined,
	});

	// Combine interactions
	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
		hover,
		click,
		dismiss,
		role,
		listNavigation,
		typeahead,
	]);

	// Exit animation - delays unmount for close animation
	const shouldRender = useExitAnimation(isOpen, 150);

	return {
		// State
		isOpen,
		setIsOpen,

		// Navigation
		activeIndex,
		setActiveIndex,
		selectedIndex,

		// Refs
		listRef,
		labelsRef,

		// Floating UI
		refs,
		floatingStyles,
		floatingContext: context,
		placement: actualPlacement,

		// Prop getters
		getReferenceProps,
		getFloatingProps,
		getItemProps,

		// Behavior
		shouldRender,
		dataState: isOpen ? "open" : "closed",

		// IDs
		contentId,

		// Options
		trigger,
	};
}
