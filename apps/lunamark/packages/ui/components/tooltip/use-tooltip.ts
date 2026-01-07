"use client";

import { useId } from "react";
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useHover,
	useFocus,
	useDismiss,
	useRole,
	useInteractions,
	type Placement,
	type FloatingContext,
} from "@floating-ui/react";
import { useControllableState } from "@ui/hooks/state/use-controllable-state";
import { useExitAnimation } from "@ui/hooks/animation/use-exit-animation";

export type UseTooltipOptions = {
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement;
	delayDuration?: number;
	sideOffset?: number;
};

export type UseTooltipReturn = {
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
};

export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
	const {
		defaultOpen = false,
		open,
		onOpenChange,
		placement = "top",
		delayDuration = 300,
		sideOffset = 8,
	} = options;

	const [isOpen, setIsOpen] = useControllableState({
		value: open,
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
		placement,
		middleware: [offset(sideOffset), flip(), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate,
	});

	const hover = useHover(context, {
		move: false,
		delay: { open: delayDuration, close: 0 },
	});
	const focus = useFocus(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "tooltip" });

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		focus,
		dismiss,
		role,
	]);

	const shouldRender = useExitAnimation(isOpen, 150);
	const dataState = isOpen ? "open" : "closed";

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
		dataState,
		contentId,
	};
}
