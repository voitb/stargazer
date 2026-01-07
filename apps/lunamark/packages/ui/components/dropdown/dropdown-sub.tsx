"use client";

import type { ComponentProps, ReactNode } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useHover,
	useDismiss,
	useRole,
	useListNavigation,
	useInteractions,
	useTypeahead,
	FloatingPortal,
	FloatingFocusManager,
	safePolygon,
} from "@floating-ui/react";
import { cn } from "../../utils/cn";
import {
	useDropdownContext,
	useDropdownSubContext,
	DropdownSubContext,
	type DropdownSubContextValue,
} from "./dropdown.context";
import {
	dropdownContentVariants,
	dropdownItemVariants,
	dropdownSubTriggerChevronVariants,
} from "./dropdown.variants";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useExitAnimation } from "../../hooks/use-exit-animation";
import { ChevronRightIcon } from "../icons";


export type DropdownSubProps = {
	children: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
};

function DropdownSub({
	children,
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
}: DropdownSubProps) {
	const parentContext = useDropdownContext("DropdownSub");
	const parentSubContext = useDropdownSubContext();

	const depth = parentSubContext ? parentSubContext.depth + 1 : 0;

	const closeParent = useCallback(() => {
		if (parentSubContext) {
			parentSubContext.setIsOpen(false);
			parentSubContext.closeParent();
		} else {
			parentContext.setIsOpen(false);
		}
	}, [parentContext, parentSubContext]);

	const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: "right-start",
		middleware: [
			offset({ mainAxis: 0, alignmentAxis: -4 }),
			flip({ fallbackPlacements: ["left-start"] }),
			shift({ padding: 8 }),
		],
		whileElementsMounted: autoUpdate,
	});

	const hover = useHover(context, {
		enabled: true,
		delay: { open: 75, close: 150 },
		handleClose: safePolygon({ blockPointerEvents: true }),
	});

	const dismiss = useDismiss(context, {
		ancestorScroll: true,
	});

	const role = useRole(context, { role: "menu" });

	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		onNavigate: setActiveIndex,
		loop: true,
		nested: true,
	});

	const typeahead = useTypeahead(context, {
		listRef: labelsRef,
		activeIndex,
		onMatch: isOpen ? setActiveIndex : undefined,
	});

	const {
		getReferenceProps: getSubTriggerProps,
		getFloatingProps: getSubFloatingProps,
		getItemProps: getSubItemProps,
	} = useInteractions([hover, dismiss, role, listNavigation, typeahead]);

	const contextValue: DropdownSubContextValue = useMemo(
		() => ({
			isOpen,
			setIsOpen,
			refs,
			floatingStyles,
			floatingContext: context,
			activeIndex,
			setActiveIndex,
			listRef,
			labelsRef,
			getSubTriggerProps,
			getSubFloatingProps,
			getSubItemProps,
			contentId,
			depth,
			closeParent,
		}),
		[
			isOpen,
			setIsOpen,
			refs,
			floatingStyles,
			context,
			activeIndex,
			setActiveIndex,
			getSubTriggerProps,
			getSubFloatingProps,
			getSubItemProps,
			contentId,
			depth,
			closeParent,
		]
	);

	return (
		<DropdownSubContext.Provider value={contextValue}>
			{children}
		</DropdownSubContext.Provider>
	);
}

export type DropdownSubTriggerProps = {
	children: ReactNode;
	disabled?: boolean;
	className?: string;
	textValue?: string;
} & Omit<
	ComponentProps<"button">,
	| "children"
	| "className"
	| "onClick"
	| "disabled"
	| "type"
	| "role"
	| "tabIndex"
>;

function DropdownSubTrigger({
	children,
	disabled = false,
	className,
	textValue,
	...props
}: DropdownSubTriggerProps) {
	const parentSubContext = useDropdownSubContext();
	const parentContext = useDropdownContext("DropdownSubTrigger");
	const subContext = useDropdownSubContext();

	if (!subContext) {
		throw new Error(
			"<DropdownSubTrigger> must be used within a <DropdownSub> provider"
		);
	}

	const parentList = parentSubContext
		? {
			activeIndex: parentSubContext.activeIndex,
			listRef: parentSubContext.listRef,
			labelsRef: parentSubContext.labelsRef,
			getItemProps: parentSubContext.getSubItemProps,
		}
		: {
			activeIndex: parentContext.activeIndex,
			listRef: parentContext.listRef,
			labelsRef: parentContext.labelsRef,
			getItemProps: parentContext.getItemProps,
		};

	const { activeIndex, listRef, labelsRef, getItemProps } = parentList;
	const { refs, getSubTriggerProps, isOpen, contentId } = subContext;

	const itemRef = useRef<HTMLButtonElement>(null);
	const index = useRef<number>(-1);

	const refCallback = useCallback(
		(node: HTMLButtonElement | null) => {
			itemRef.current = node;
			refs.setReference(node);
			if (node) {
				const currentIndex = listRef.current.indexOf(node);
				if (currentIndex === -1) {
					index.current = listRef.current.length;
					listRef.current.push(node);
					labelsRef.current.push(textValue ?? node.textContent);
				} else {
					index.current = currentIndex;
				}
			}
		},
		[refs, listRef, labelsRef, textValue]
	);

	useEffect(() => {
		return () => {
			if (itemRef.current) {
				const idx = listRef.current.indexOf(itemRef.current);
				if (idx !== -1) {
					listRef.current.splice(idx, 1);
					labelsRef.current.splice(idx, 1);
				}
			}
		};
	}, [listRef, labelsRef]);

	const isHighlighted = activeIndex === index.current;

	return (
		<button
			ref={refCallback}
			type="button"
			role="menuitem"
			aria-haspopup="menu"
			aria-expanded={isOpen}
			aria-controls={isOpen ? contentId : undefined}
			tabIndex={isHighlighted ? 0 : -1}
			disabled={disabled}
			data-dropdown-sub-trigger
			data-highlighted={isHighlighted}
			data-disabled={disabled}
			data-state={isOpen ? "open" : "closed"}
			className={cn(
				dropdownItemVariants({
					highlighted: isHighlighted,
					disabled,
				}),
				className
			)}
			{...getItemProps({ active: isHighlighted })}
			{...getSubTriggerProps()}
			{...props}
		>
			{children}
			<ChevronRightIcon className={cn(dropdownSubTriggerChevronVariants())} />
		</button>
	);
}

export type DropdownSubContentProps = {
	children: ReactNode;
	className?: string;
} & Omit<
	ComponentProps<"div">,
	"children" | "className" | "style" | "id" | "role"
>;

function DropdownSubContent({
	children,
	className,
	...props
}: DropdownSubContentProps) {
	const subContext = useDropdownSubContext();

	if (!subContext) {
		throw new Error(
			"<DropdownSubContent> must be used within a <DropdownSub> provider"
		);
	}

	const {
		isOpen,
		refs,
		floatingStyles,
		getSubFloatingProps,
		contentId,
		floatingContext,
	} = subContext;

	const shouldRender = useExitAnimation(isOpen, 150);
	const dataState = isOpen ? "open" : "closed";

	if (!shouldRender) return null;

	return (
		<FloatingPortal>
			<FloatingFocusManager
				context={floatingContext}
				modal={false}
				initialFocus={-1}
			>
				<div
					id={contentId}
					ref={refs.setFloating}
					role="menu"
					data-floating-content
					data-dropdown-sub-content
					data-state={dataState}
					style={floatingStyles}
					className={cn(dropdownContentVariants(), className)}
					{...getSubFloatingProps()}
					{...props}
				>
					{children}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	);
}

export { DropdownSub, DropdownSubTrigger, DropdownSubContent };
