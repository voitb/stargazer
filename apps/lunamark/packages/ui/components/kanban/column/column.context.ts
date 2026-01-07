"use client";

import { createContext, useContext } from "react";

export type ColumnContextValue = {
	isDropTarget: boolean;
	isCollapsed: boolean;
	toggleCollapsed: () => void;
	itemCount: number;
	isEmpty: boolean;
	dataState: "default" | "active" | "collapsed";
	size: "sm" | "md" | "lg";
	contentId: string;
};

export const ColumnContext = createContext<ColumnContextValue | null>(null);

export function useColumnContext(componentName: string): ColumnContextValue {
	const context = useContext(ColumnContext);
	if (!context) {
		throw new Error(
			`<${componentName}> must be used within a <Column> provider`
		);
	}
	return context;
}
