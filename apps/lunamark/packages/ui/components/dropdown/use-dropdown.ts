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
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement;
	sideOffset?: number;
	trigger?: "hover" | "click";
	loop?: boolean;
	modal?: boolean;
};

export type UseDropdownReturn = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	activeIndex: number | null;
	setActiveIndex: (index: number | null) => void;
	selectedIndex: number | null;
	listRef: React.MutableRefObject<(HTMLElement | null)[]>;
	labelsRef: React.MutableRefObject<(string | null)[]>;
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	floatingContext: FloatingContext;
	placement: Placement;
	getReferenceProps: () => Record<string, unknown>;
	getFloatingProps: () => Record<string, unknown>;
	getItemProps: (options: {
		active: boolean;
		onClick?: () => void;
	}) => Record<string, unknown>;
	shouldRender: boolean;
	dataState: "open" | "closed";
	contentId: string;
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

	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const selectedIndex: number | null = null;

	const [isOpen, setIsOpenBase] = useControllableState({
		value: controlledOpen,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	const setIsOpen = useCallback(
		(nextOpen: boolean) => {
			setIsOpenBase(nextOpen);
			if (!nextOpen) {
				setActiveIndex(null);
			}
		},
		[setIsOpenBase]
	);

	const contentId = useId();

	const listRef = useRef<(HTMLElement | null)[]>([]);
	const labelsRef = useRef<(string | null)[]>([]);

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

	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
		hover,
		click,
		dismiss,
		role,
		listNavigation,
		typeahead,
	]);

	const shouldRender = useExitAnimation(isOpen, 150);

	return {
		isOpen,
		setIsOpen,
		activeIndex,
		setActiveIndex,
		selectedIndex,
		listRef,
		labelsRef,
		refs,
		floatingStyles,
		floatingContext: context,
		placement: actualPlacement,
		getReferenceProps,
		getFloatingProps,
		getItemProps,
		shouldRender,
		dataState: isOpen ? "open" : "closed",
		contentId,
		trigger,
	};
}
