"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { DialogContext, type DialogContextValue } from "./dialog.context";

export type DialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	closeOnBackdropClick?: boolean;
	children: ReactNode;
};

export function Dialog({
	open,
	onOpenChange,
	closeOnBackdropClick = true,
	children,
}: DialogProps) {
	const titleId = useId();
	const descriptionId = useId();

	const contextValue: DialogContextValue = {
		open,
		onOpenChange,
		closeOnBackdropClick,
		titleId,
		descriptionId,
	};

	return (
		<DialogContext.Provider value={contextValue}>
			{children}
		</DialogContext.Provider>
	);
}
