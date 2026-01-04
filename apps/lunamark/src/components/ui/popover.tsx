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
	useInteractions,
	FloatingPortal,
	FloatingFocusManager,
	type Placement,
	type FloatingContext,
} from "@floating-ui/react";
import {
	cloneElement,
	createContext,
	isValidElement,
	useContext,
	useId,
	useMemo,
	type ReactElement,
	type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { useControllableState } from "@/hooks/ui/use-controllable-state";
import { useExitAnimation } from "@/hooks/ui/use-exit-animation";

type PopoverContextValue = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	trigger: "hover" | "click";
	getReferenceProps: () => Record<string, unknown>;
	getFloatingProps: () => Record<string, unknown>;
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	placement: Placement;
	contentId: string;
	floatingContext: FloatingContext;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
	const context = useContext(PopoverContext);
	if (!context) {
		throw new Error("Popover components must be used within a Popover provider");
	}
	return context;
}

type PopoverProps = {
	trigger?: "hover" | "click";
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement;
	sideOffset?: number;
	children: ReactNode;
};

function Popover({
	trigger = "click",
	open,
	onOpenChange,
	placement = "bottom",
	sideOffset = 8,
	children,
}: PopoverProps) {
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

	const click = useClick(context, {
		enabled: trigger === "click",
	});

	const dismiss = useDismiss(context, {
		ancestorScroll: true,
	});

	const role = useRole(context, { role: "dialog" });

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		click,
		dismiss,
		role,
	]);

	const contextValue = useMemo(
		() => ({
			isOpen,
			setIsOpen,
			trigger,
			getReferenceProps,
			getFloatingProps,
			refs,
			floatingStyles,
			placement: actualPlacement,
			contentId,
			floatingContext: context,
		}),
		[
			isOpen,
			setIsOpen,
			trigger,
			getReferenceProps,
			getFloatingProps,
			refs,
			floatingStyles,
			actualPlacement,
			contentId,
			context,
		]
	);

	return (
		<PopoverContext.Provider value={contextValue}>
			{children}
		</PopoverContext.Provider>
	);
}

type PopoverTriggerProps = {
	children: ReactElement;
	asChild?: boolean;
};

function PopoverTrigger({ children, asChild = true }: PopoverTriggerProps) {
	const { refs, getReferenceProps, isOpen, contentId } = usePopoverContext();

	if (!asChild || !isValidElement(children)) {
		return (
			<button
				ref={refs.setReference}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				aria-controls={isOpen ? contentId : undefined}
				{...getReferenceProps()}
			>
				{children}
			</button>
		);
	}

	return cloneElement(children, {
		ref: refs.setReference,
		"aria-haspopup": "dialog",
		"aria-expanded": isOpen,
		"aria-controls": isOpen ? contentId : undefined,
		...getReferenceProps(),
	} as object);
}

type PopoverContentProps = {
	children: ReactNode;
	className?: string;
};

function PopoverContent({ children, className }: PopoverContentProps) {
	const {
		isOpen,
		refs,
		floatingStyles,
		getFloatingProps,
		placement,
		contentId,
		trigger,
		floatingContext,
	} = usePopoverContext();

	const shouldRender = useExitAnimation(isOpen, 150);

	const side = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
	const dataState = isOpen ? "open" : "closed";

	if (!shouldRender) return null;

	const content = (
		<div
			id={contentId}
			ref={refs.setFloating}
			role="dialog"
			aria-modal={trigger === "click"}
			data-floating-content
			data-popover-content
			data-state={dataState}
			data-side={side}
			style={floatingStyles}
			className={cn(
				"z-50 w-72 p-4 rounded-lg border shadow-lg",
				"bg-[rgb(var(--ui-bg))] text-[rgb(var(--ui-fg))] border-[rgb(var(--ui-border))]",
				className
			)}
			{...getFloatingProps()}
		>
			{children}
		</div>
	);

	return (
		<FloatingPortal>
			{trigger === "click" ? (
				<FloatingFocusManager context={floatingContext} modal={false}>
					{content}
				</FloatingFocusManager>
			) : (
				content
			)}
		</FloatingPortal>
	);
}

type PopoverCloseProps = {
	children?: ReactNode;
	className?: string;
};

function PopoverClose({ children, className }: PopoverCloseProps) {
	const { setIsOpen } = usePopoverContext();

	return (
		<button
			type="button"
			onClick={() => setIsOpen(false)}
			className={cn(
				"absolute right-2 top-2 rounded-sm opacity-70 transition-opacity",
				"hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ui-border-focus))]",
				className
			)}
			aria-label="Close"
		>
			{children || <CloseIcon />}
		</button>
	);
}

function CloseIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
}

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };
