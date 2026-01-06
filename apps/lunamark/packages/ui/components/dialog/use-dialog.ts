"use client";

import { useCallback, useId } from "react";
import { useControllableState } from "../../hooks/use-controllable-state";

export type UseDialogOptions = {
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export type UseDialogReturn = {
	open: boolean;
	setOpen: (open: boolean) => void;
	onOpenChange: (open: boolean) => void;
	titleId: string;
	descriptionId: string;
	getTriggerProps: () => {
		"aria-haspopup": "dialog";
		"aria-expanded": boolean;
		onClick: () => void;
	};
	getContentProps: () => {
		role: "dialog";
		"aria-modal": true;
		"aria-labelledby": string;
		"aria-describedby": string;
	};
	getTitleProps: () => { id: string };
	getDescriptionProps: () => { id: string };
	getCloseProps: () => { onClick: () => void };
};

export function useDialog(options: UseDialogOptions = {}): UseDialogReturn {
	const { defaultOpen = false, open: controlledOpen, onOpenChange } = options;

	const [isOpen, setOpen] = useControllableState({
		value: controlledOpen,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	const titleId = useId();
	const descriptionId = useId();

	const handleOpen = useCallback(() => setOpen(true), [setOpen]);
	const handleClose = useCallback(() => setOpen(false), [setOpen]);

	return {
		open: isOpen,
		setOpen,
		onOpenChange: setOpen,
		titleId,
		descriptionId,

		getTriggerProps: () => ({
			"aria-haspopup": "dialog" as const,
			"aria-expanded": isOpen,
			onClick: handleOpen,
		}),

		getContentProps: () => ({
			role: "dialog" as const,
			"aria-modal": true as const,
			"aria-labelledby": titleId,
			"aria-describedby": descriptionId,
		}),

		getTitleProps: () => ({ id: titleId }),
		getDescriptionProps: () => ({ id: descriptionId }),
		getCloseProps: () => ({ onClick: handleClose }),
	};
}
