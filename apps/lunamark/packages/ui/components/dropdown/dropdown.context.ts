"use client";

import { createContext, useContext } from "react";
import type { FloatingContext, Placement } from "@floating-ui/react";

type DropdownItemInteractionProps = Omit<
	React.HTMLProps<HTMLElement>,
	"active" | "selected"
> & {
	active?: boolean;
	selected?: boolean;
};

export type DropdownContextValue = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	activeIndex: number | null;
	setActiveIndex: (index: number | null) => void;
	listRef: React.MutableRefObject<(HTMLElement | null)[]>;
	labelsRef: React.MutableRefObject<(string | null)[]>;
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	floatingContext: FloatingContext;
	placement: Placement;
	getReferenceProps: (
		userProps?: React.HTMLProps<Element>
	) => Record<string, unknown>;
	getFloatingProps: (
		userProps?: React.HTMLProps<HTMLElement>
	) => Record<string, unknown>;
	getItemProps: (
		userProps?: DropdownItemInteractionProps
	) => Record<string, unknown>;
	contentId: string;
	trigger: "hover" | "click";
};

export const DropdownContext = createContext<DropdownContextValue | null>(null);

export function useDropdownContext(componentName: string): DropdownContextValue {
	const context = useContext(DropdownContext);
	if (!context) {
		throw new Error(
			`<${componentName}> must be used within a <Dropdown> provider`
		);
	}
	return context;
}

export type DropdownRadioGroupContextValue = {
	value: string;
	onValueChange: (value: string) => void;
};

export const DropdownRadioGroupContext =
	createContext<DropdownRadioGroupContextValue | null>(null);

export function useDropdownRadioGroupContext(
	componentName: string
): DropdownRadioGroupContextValue {
	const context = useContext(DropdownRadioGroupContext);
	if (!context) {
		throw new Error(
			`<${componentName}> must be used within a <DropdownRadioGroup> provider`
		);
	}
	return context;
}

export type DropdownSubContextValue = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	floatingContext: FloatingContext;
	activeIndex: number | null;
	setActiveIndex: (index: number | null) => void;
	listRef: React.MutableRefObject<(HTMLElement | null)[]>;
	labelsRef: React.MutableRefObject<(string | null)[]>;
	getSubTriggerProps: (
		userProps?: React.HTMLProps<Element>
	) => Record<string, unknown>;
	getSubFloatingProps: (
		userProps?: React.HTMLProps<HTMLElement>
	) => Record<string, unknown>;
	getSubItemProps: (
		userProps?: DropdownItemInteractionProps
	) => Record<string, unknown>;
	contentId: string;
	depth: number;
	closeParent: () => void;
};

export const DropdownSubContext =
	createContext<DropdownSubContextValue | null>(null);

export function useDropdownSubContext(
	componentName: string
): DropdownSubContextValue;
export function useDropdownSubContext(): DropdownSubContextValue | null;
export function useDropdownSubContext(
	componentName?: string
): DropdownSubContextValue | null {
	const context = useContext(DropdownSubContext);
	if (!context && componentName) {
		throw new Error(
			`<${componentName}> must be used within a <DropdownSub> provider`
		);
	}
	return context;
}

export type DropdownListContextValue = {
	activeIndex: number | null;
	listRef: React.MutableRefObject<(HTMLElement | null)[]>;
	labelsRef: React.MutableRefObject<(string | null)[]>;
	getItemProps: (
		userProps?: DropdownItemInteractionProps
	) => Record<string, unknown>;
	closeMenu: () => void;
};

export const DropdownListContext =
	createContext<DropdownListContextValue | null>(null);

export function useDropdownListContext(
	componentName: string
): DropdownListContextValue {
	const context = useContext(DropdownListContext);
	if (!context) {
		throw new Error(
			`<${componentName}> must be used within a <DropdownContent> or <DropdownSubContent> provider`
		);
	}
	return context;
}
