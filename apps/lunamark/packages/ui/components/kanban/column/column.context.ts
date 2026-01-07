"use client";

import type { VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";
import { columnVariants } from "./column.variants";

type ColumnVariantProps = VariantProps<typeof columnVariants>;

export type ColumnContextValue = {
	isDropTarget: boolean;
	isCollapsed: boolean;
	toggleCollapsed: () => void;
	itemCount: number;
	isEmpty: boolean;
	dataState: "default" | "active" | "collapsed";
	size: NonNullable<ColumnVariantProps["size"]> | null;
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
