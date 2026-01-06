"use client";

import { createContext, useContext } from "react";
import type { FloatingContext, Placement } from "@floating-ui/react";

/**
 * Main dropdown context - shared between all dropdown components
 */
export type DropdownContextValue = {
	// State
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;

	// Navigation
	activeIndex: number | null;
	setActiveIndex: (index: number | null) => void;
	selectedIndex: number | null;

	// Refs for Floating UI list navigation
	listRef: React.MutableRefObject<(HTMLElement | null)[]>;
	labelsRef: React.MutableRefObject<(string | null)[]>;

	// Floating UI integration
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
	getItemProps: (options: {
		active: boolean;
		onClick?: () => void;
	}) => Record<string, unknown>;

	// IDs
	contentId: string;

	// Options
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

/**
 * Radio group context - for managing radio item selection
 */
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

/**
 * Submenu context - for nested dropdown menus
 */
export type DropdownSubContextValue = {
	// Submenu state
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;

	// Submenu Floating UI (separate from parent)
	refs: {
		setReference: (node: HTMLElement | null) => void;
		setFloating: (node: HTMLElement | null) => void;
	};
	floatingStyles: React.CSSProperties;
	floatingContext: FloatingContext;

	// Navigation for submenu items
	activeIndex: number | null;
	setActiveIndex: (index: number | null) => void;
	listRef: React.MutableRefObject<(HTMLElement | null)[]>;
	labelsRef: React.MutableRefObject<(string | null)[]>;

	// Prop getters for submenu
	getSubTriggerProps: () => Record<string, unknown>;
	getSubFloatingProps: () => Record<string, unknown>;
	getSubItemProps: (options: {
		active: boolean;
		onClick?: () => void;
	}) => Record<string, unknown>;

	// Content ID for accessibility
	contentId: string;

	// Depth tracking for nested submenus
	depth: number;

	// Reference to parent close function
	closeParent: () => void;
};

export const DropdownSubContext =
	createContext<DropdownSubContextValue | null>(null);

export function useDropdownSubContext(): DropdownSubContextValue | null {
	return useContext(DropdownSubContext);
}
