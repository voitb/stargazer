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
	FloatingPortal,
	FloatingFocusManager,
	type Placement,
	type FloatingContext,
} from "@floating-ui/react";
import {
	cloneElement,
	createContext,
	isValidElement,
	useCallback,
	useContext,
	useId,
	useMemo,
	useRef,
	useState,
	type ReactElement,
	type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { useControllableState } from "@/hooks/ui/use-controllable-state";
import { useExitAnimation } from "@/hooks/ui/use-exit-animation";

type DropdownContextValue = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	trigger: "hover" | "click";
	activeIndex: number | null;
	selectedIndex: number | null;
	getItemProps: (index: number) => Record<string, unknown>;
	getReferenceProps: () => Record<string, unknown>;
	getFloatingProps: () => Record<string, unknown>;
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	placement: Placement;
	contentId: string;
	listRef: React.MutableRefObject<(HTMLElement | null)[]>;
	labelsRef: React.MutableRefObject<(string | null)[]>;
	floatingContext: FloatingContext;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
	const context = useContext(DropdownContext);
	if (!context) {
		throw new Error("Dropdown components must be used within a Dropdown provider");
	}
	return context;
}

type DropdownProps = {
	trigger?: "hover" | "click";
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement;
	sideOffset?: number;
	children: ReactNode;
};

function Dropdown({
	trigger = "click",
	open,
	onOpenChange,
	placement = "bottom-start",
	sideOffset = 4,
	children,
}: DropdownProps) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const [isOpen, setIsOpenBase] = useControllableState({
		value: open,
		defaultValue: false,
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
		delay: { open: 150, close: 200 },
	});

	const click = useClick(context, {
		enabled: trigger === "click",
	});

	const dismiss = useDismiss(context);

	const role = useRole(context, { role: "menu" });

	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		selectedIndex,
		onNavigate: setActiveIndex,
		loop: true,
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

	const contextValue = useMemo(
		() => ({
			isOpen,
			setIsOpen,
			trigger,
			activeIndex,
			selectedIndex,
			getItemProps: (index: number) =>
				getItemProps({
					onClick: () => setSelectedIndex(index),
				}),
			getReferenceProps,
			getFloatingProps,
			refs,
			floatingStyles,
			placement: actualPlacement,
			contentId,
			listRef,
			labelsRef,
			floatingContext: context,
		}),
		[
			isOpen,
			setIsOpen,
			trigger,
			activeIndex,
			selectedIndex,
			getItemProps,
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
		<DropdownContext.Provider value={contextValue}>
			{children}
		</DropdownContext.Provider>
	);
}

type DropdownTriggerProps = {
	children: ReactElement;
	asChild?: boolean;
};

function DropdownTrigger({ children, asChild = true }: DropdownTriggerProps) {
	const { refs, getReferenceProps, isOpen, contentId } = useDropdownContext();

	if (!asChild || !isValidElement(children)) {
		return (
			<button
				ref={refs.setReference}
				aria-haspopup="menu"
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
		"aria-haspopup": "menu",
		"aria-expanded": isOpen,
		"aria-controls": isOpen ? contentId : undefined,
		...getReferenceProps(),
	} as object);
}

type DropdownContentProps = {
	children: ReactNode;
	className?: string;
};

function DropdownContent({ children, className }: DropdownContentProps) {
	const {
		isOpen,
		refs,
		floatingStyles,
		getFloatingProps,
		placement,
		contentId,
		floatingContext,
	} = useDropdownContext();

	const shouldRender = useExitAnimation(isOpen, 150);

	const side = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
	const dataState = isOpen ? "open" : "closed";

	if (!shouldRender) return null;

	return (
		<FloatingPortal>
			<FloatingFocusManager context={floatingContext} modal={false}>
				<div
					id={contentId}
					ref={refs.setFloating}
					role="menu"
					data-floating-content
					data-dropdown-content
					data-state={dataState}
					data-side={side}
					style={floatingStyles}
					className={cn(
						"z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
						"bg-[rgb(var(--ui-bg))] text-[rgb(var(--ui-fg))] border-[rgb(var(--ui-border))]",
						className
					)}
					{...getFloatingProps()}
				>
					{children}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	);
}

type DropdownItemProps = {
	children: ReactNode;
	onSelect?: () => void;
	disabled?: boolean;
	destructive?: boolean;
	className?: string;
};

function DropdownItem({
	children,
	onSelect,
	disabled = false,
	destructive = false,
	className,
}: DropdownItemProps) {
	const { setIsOpen, activeIndex, listRef, labelsRef, getItemProps } =
		useDropdownContext();
	const itemRef = useRef<HTMLButtonElement>(null);

	const index = useRef<number>(-1);

	// Register item on mount
	const refCallback = useCallback(
		(node: HTMLButtonElement | null) => {
			itemRef.current = node;
			if (node) {
				const currentIndex = listRef.current.indexOf(node);
				if (currentIndex === -1) {
					index.current = listRef.current.length;
					listRef.current.push(node);
					labelsRef.current.push(node.textContent);
				} else {
					index.current = currentIndex;
				}
			}
		},
		[listRef, labelsRef]
	);

	const isHighlighted = activeIndex === index.current;

	const handleSelect = useCallback(() => {
		if (disabled) return;
		onSelect?.();
		setIsOpen(false);
	}, [disabled, onSelect, setIsOpen]);

	return (
		<button
			ref={refCallback}
			type="button"
			role="menuitem"
			tabIndex={isHighlighted ? 0 : -1}
			disabled={disabled}
			data-dropdown-item
			data-highlighted={isHighlighted}
			data-disabled={disabled}
			className={cn(
				"relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
				"focus:bg-[rgb(var(--ui-bg-tertiary))]",
				isHighlighted && "bg-[rgb(var(--ui-bg-tertiary))]",
				disabled && "opacity-50 pointer-events-none",
				destructive && "text-[rgb(var(--ui-danger))]",
				className
			)}
			onClick={handleSelect}
			{...getItemProps(index.current)}
		>
			{children}
		</button>
	);
}

type DropdownSeparatorProps = {
	className?: string;
};

function DropdownSeparator({ className }: DropdownSeparatorProps) {
	return (
		<div
			role="separator"
			className={cn("-mx-1 my-1 h-px bg-[rgb(var(--ui-border))]", className)}
		/>
	);
}

type DropdownLabelProps = {
	children: ReactNode;
	className?: string;
};

function DropdownLabel({ children, className }: DropdownLabelProps) {
	return (
		<div
			className={cn(
				"px-2 py-1.5 text-xs font-semibold text-[rgb(var(--ui-fg-muted))]",
				className
			)}
		>
			{children}
		</div>
	);
}

export {
	Dropdown,
	DropdownTrigger,
	DropdownContent,
	DropdownItem,
	DropdownSeparator,
	DropdownLabel,
};
