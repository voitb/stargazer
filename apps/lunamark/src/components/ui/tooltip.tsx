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
	FloatingPortal,
	type Placement,
} from "@floating-ui/react";
import {
	cloneElement,
	isValidElement,
	useId,
	type ReactElement,
	type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { useControllableState } from "@/hooks/ui/use-controllable-state";
import { useExitAnimation } from "@/hooks/ui/use-exit-animation";

type TooltipProps = {
	content: ReactNode;
	children: ReactElement;
	trigger?: "hover" | "click";
	placement?: Placement;
	sideOffset?: number;
	delayDuration?: number;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	className?: string;
	showOnFocus?: boolean;
};

function Tooltip({
	content,
	children,
	trigger = "hover",
	placement = "top",
	sideOffset = 6,
	delayDuration = 300,
	open,
	onOpenChange,
	className,
	showOnFocus = true,
}: TooltipProps) {
	const [isOpen, setIsOpen] = useControllableState({
		value: open,
		defaultValue: false,
		onChange: onOpenChange,
	});

	const tooltipId = useId();

	const { refs, floatingStyles, context, placement: actualPlacement } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
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
		delay: { open: delayDuration, close: 100 },
	});

	const focus = useFocus(context, {
		enabled: showOnFocus,
	});

	const click = useClick(context, {
		enabled: trigger === "click",
	});

	const dismiss = useDismiss(context, {
		ancestorScroll: true,
	});

	const role = useRole(context, { role: "tooltip" });

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		focus,
		click,
		dismiss,
		role,
	]);

	const shouldRender = useExitAnimation(isOpen, 100);

	const side = actualPlacement.split("-")[0] as "top" | "bottom" | "left" | "right";
	const dataState = isOpen ? "open" : "closed";

	if (!isValidElement(children)) {
		return null;
	}

	return (
		<>
			{cloneElement(children, {
				ref: refs.setReference,
				"aria-describedby": isOpen ? tooltipId : undefined,
				...getReferenceProps(),
			} as object)}

			{shouldRender && (
				<FloatingPortal>
					<div
						id={tooltipId}
						ref={refs.setFloating}
						role="tooltip"
						data-floating-content
						data-tooltip-content
						data-state={dataState}
						data-side={side}
						style={floatingStyles}
						className={cn(
							"z-50 px-3 py-1.5 text-xs rounded-md shadow-md",
							"bg-[rgb(var(--ui-fg))] text-[rgb(var(--ui-bg))]",
							"max-w-xs",
							className
						)}
						{...getFloatingProps()}
					>
						{content}
					</div>
				</FloatingPortal>
			)}
		</>
	);
}

export { Tooltip };
