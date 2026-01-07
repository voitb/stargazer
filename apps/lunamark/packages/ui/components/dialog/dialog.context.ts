"use client";

import type { MouseEvent, RefObject } from "react";
import { createContext, useContext } from "react";

export type DialogContextValue = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	titleId: string;
	descriptionId: string;
	contentRef: RefObject<HTMLDivElement | null>;
	shouldRender: boolean;
	handleBackdropClick: (event: MouseEvent<HTMLDivElement>) => void;
	dataState: "open" | "closed";
};

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(componentName: string): DialogContextValue {
	const context = useContext(DialogContext);
	if (!context) {
		throw new Error(
			`<${componentName}> must be used within a <Dialog> provider`
		);
	}
	return context;
}
