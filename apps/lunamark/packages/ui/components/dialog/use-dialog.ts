"use client";

import { useCallback, useId, useRef } from "react";
import { useBodyScrollLock } from "@ui/hooks/scroll/use-body-scroll-lock";
import { useControllableState } from "@ui/hooks/state/use-controllable-state";
import { useExitAnimation } from "@ui/hooks/animation/use-exit-animation";
import { useFocusTrap } from "@ui/hooks/focus/use-focus-trap";
import { useKeyboardShortcut } from "@ui/hooks/navigation/use-keyboard-shortcut";

export type UseDialogOptions = {
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	closeOnBackdropClick?: boolean;
	closeOnEscape?: boolean;
	preventScroll?: boolean;
};

export type UseDialogReturn = {
	open: boolean;
	setOpen: (open: boolean) => void;
	onOpenChange: (open: boolean) => void;

	titleId: string;
	descriptionId: string;

	contentRef: React.RefObject<HTMLDivElement | null>;
	shouldRender: boolean;
	handleBackdropClick: (event: React.MouseEvent) => void;
	dataState: "open" | "closed";

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
	const {
		defaultOpen = false,
		open: controlledOpen,
		onOpenChange,
		closeOnBackdropClick = true,
		closeOnEscape = true,
		preventScroll = true,
	} = options;

	const [isOpen, setOpen] = useControllableState({
		value: controlledOpen,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	const titleId = useId();
	const descriptionId = useId();

	const contentRef = useRef<HTMLDivElement>(null);

	useBodyScrollLock(isOpen && preventScroll);
	useFocusTrap(contentRef, isOpen);

	useKeyboardShortcut({
		key: "Escape",
		handler: () => setOpen(false),
		enabled: isOpen && closeOnEscape,
		ignoreInputFields: false,
	});

	const shouldRender = useExitAnimation(isOpen, 150);

	const handleBackdropClick = useCallback(
		(event: React.MouseEvent) => {
			if (closeOnBackdropClick && event.target === event.currentTarget) {
				setOpen(false);
			}
		},
		[closeOnBackdropClick, setOpen]
	);

	return {
		open: isOpen,
		setOpen,
		onOpenChange: setOpen,
		titleId,
		descriptionId,
		contentRef,
		shouldRender,
		handleBackdropClick,
		dataState: isOpen ? "open" : "closed",

		getTriggerProps: () => ({
			"aria-haspopup": "dialog" as const,
			"aria-expanded": isOpen,
			onClick: () => setOpen(true),
		}),

		getContentProps: () => ({
			role: "dialog" as const,
			"aria-modal": true as const,
			"aria-labelledby": titleId,
			"aria-describedby": descriptionId,
		}),

		getTitleProps: () => ({ id: titleId }),
		getDescriptionProps: () => ({ id: descriptionId }),
		getCloseProps: () => ({ onClick: () => setOpen(false) }),
	};
}
