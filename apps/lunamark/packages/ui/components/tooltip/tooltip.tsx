"use client";

import { createContext, useContext, useId, useMemo, type ReactNode } from "react";
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
	FloatingPortal,
	type Placement,
} from "@floating-ui/react";
import { cn } from "../../utils/cn";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useExitAnimation } from "../../hooks/use-exit-animation";

type TooltipContextValue = {
	isOpen: boolean;
	getReferenceProps: () => Record<string, unknown>;
	getFloatingProps: () => Record<string, unknown>;
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	placement: Placement;
	contentId: string;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
	const context = useContext(TooltipContext);
	if (!context) {
		throw new Error("Tooltip components must be used within a Tooltip provider");
	}
	return context;
}

type TooltipProps = {
	children: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement;
	delayDuration?: number;
	sideOffset?: number;
};

function Tooltip({
	children,
	open,
	onOpenChange,
	placement = "top",
	delayDuration = 300,
	sideOffset = 8,
}: TooltipProps) {
	const [isOpen, setIsOpen] = useControllableState({
		value: open,
		defaultValue: false,
		onChange: onOpenChange,
	});

	const contentId = useId();

	const { refs, floatingStyles, context, placement: actualPlacement } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		middleware: [offset(sideOffset), flip(), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate,
	});

	const hover = useHover(context, { move: false, delay: { open: delayDuration, close: 0 } });
	const focus = useFocus(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "tooltip" });

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		focus,
		dismiss,
		role,
	]);

	const contextValue = useMemo(
		() => ({
			isOpen,
			getReferenceProps,
			getFloatingProps,
			refs,
			floatingStyles,
			placement: actualPlacement,
			contentId,
		}),
		[isOpen, getReferenceProps, getFloatingProps, refs, floatingStyles, actualPlacement, contentId]
	);

	return (
		<TooltipContext.Provider value={contextValue}>
			{children}
		</TooltipContext.Provider>
	);
}

type TooltipTriggerProps = {
	children: ReactNode;
};

function TooltipTrigger({ children }: TooltipTriggerProps) {
	const { refs, getReferenceProps } = useTooltipContext();

	return (
		<span ref={refs.setReference} {...getReferenceProps()}>
			{children}
		</span>
	);
}

type TooltipContentProps = {
	children: ReactNode;
	className?: string;
};

function TooltipContent({ children, className }: TooltipContentProps) {
	const { isOpen, refs, floatingStyles, getFloatingProps, placement, contentId } =
		useTooltipContext();

	const shouldRender = useExitAnimation(isOpen, 150);

	if (!shouldRender) return null;

	const side = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
	const dataState = isOpen ? "open" : "closed";

	return (
		<FloatingPortal>
			<div
				id={contentId}
				ref={refs.setFloating}
				role="tooltip"
				data-floating-content
				data-tooltip-content
				data-state={dataState}
				data-side={side}
				style={floatingStyles}
				className={cn(
					"z-50 rounded-md px-3 py-1.5 text-xs shadow-md",
					"bg-[rgb(var(--color-neutral-background-inverted))] text-[rgb(var(--color-neutral-foreground-inverted))]",
					className
				)}
				{...getFloatingProps()}
			>
				{children}
			</div>
		</FloatingPortal>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent };
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps };
