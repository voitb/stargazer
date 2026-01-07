"use client";

import { createContext, useContext } from "react";
import type { FloatingContext, Placement } from "@floating-ui/react";

export type DropdownContextValue = {
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
	getSubTriggerProps: () => Record<string, unknown>;
	getSubFloatingProps: () => Record<string, unknown>;
	getSubItemProps: (options: {
		active: boolean;
		onClick?: () => void;
	}) => Record<string, unknown>;
	contentId: string;
	depth: number;
	closeParent: () => void;
};

export const DropdownSubContext =
	createContext<DropdownSubContextValue | null>(null);

export function useDropdownSubContext(): DropdownSubContextValue | null {
	return useContext(DropdownSubContext);
}
