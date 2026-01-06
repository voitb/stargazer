"use client";

import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useHover,
	useFocus,
	useClick,
	useDismiss,
	useRole,
	useInteractions,
	type Placement,
	type FloatingContext,
} from "@floating-ui/react";
import { useId } from "react";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useExitAnimation } from "../../hooks/use-exit-animation";

export type UsePopoverOptions = {
	// State
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;

	// Positioning
	placement?: Placement;
	sideOffset?: number;

	// Behavior
	trigger?: "hover" | "click";
};

export type UsePopoverReturn = {
	// State
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;

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

	// Behavior
	shouldRender: boolean;
	dataState: "open" | "closed";

	// IDs
	contentId: string;

	// Options passthrough
	trigger: "hover" | "click";
};

export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
	const {
		defaultOpen = false,
		open: controlledOpen,
		onOpenChange,
		placement: requestedPlacement = "bottom",
		sideOffset = 8,
		trigger = "click",
	} = options;

	// State management with controlled/uncontrolled support
	const [isOpen, setIsOpen] = useControllableState({
		value: controlledOpen,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	// IDs for accessibility
	const contentId = useId();

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
		delay: { open: 200, close: 150 },
	});

	const focus = useFocus(context, {
		enabled: trigger === "hover",
	});

	const click = useClick(context, {
		enabled: trigger === "click",
	});

	const dismiss = useDismiss(context, {
		ancestorScroll: true,
	});

	const role = useRole(context, { role: "dialog" });

	// Combine interactions
	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		focus,
		click,
		dismiss,
		role,
	]);

	// Exit animation - delays unmount for close animation
	const shouldRender = useExitAnimation(isOpen, 150);

	return {
		// State
		isOpen,
		setIsOpen,

		// Floating UI
		refs,
		floatingStyles,
		floatingContext: context,
		placement: actualPlacement,

		// Prop getters
		getReferenceProps,
		getFloatingProps,

		// Behavior
		shouldRender,
		dataState: isOpen ? "open" : "closed",

		// IDs
		contentId,

		// Options
		trigger,
	};
}
