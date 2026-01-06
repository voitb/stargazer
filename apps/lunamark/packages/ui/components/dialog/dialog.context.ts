"use client";

import { createContext, useContext } from "react";

export type DialogContextValue = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	closeOnBackdropClick: boolean;
	titleId: string;
	descriptionId: string;
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
