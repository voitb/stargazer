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
import { useControllableState } from "@ui/hooks/state/use-controllable-state";
import { useExitAnimation } from "@ui/hooks/animation/use-exit-animation";

export type UsePopoverOptions = {
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;

	placement?: Placement;
	sideOffset?: number;

	trigger?: "hover" | "click";
};

export type UsePopoverReturn = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;

	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	floatingContext: FloatingContext;
	placement: Placement;

	getReferenceProps: () => Record<string, unknown>;
	getFloatingProps: () => Record<string, unknown>;

	shouldRender: boolean;
	dataState: "open" | "closed";

	contentId: string;

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

	const [isOpen, setIsOpen] = useControllableState({
		value: controlledOpen,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	const contentId = useId();

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

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		focus,
		click,
		dismiss,
		role,
	]);

	const shouldRender = useExitAnimation(isOpen, 150);

	return {
		isOpen,
		setIsOpen,

		refs,
		floatingStyles,
		floatingContext: context,
		placement: actualPlacement,

		getReferenceProps,
		getFloatingProps,

		shouldRender,
		dataState: isOpen ? "open" : "closed",

		contentId,

		trigger,
	};
}
