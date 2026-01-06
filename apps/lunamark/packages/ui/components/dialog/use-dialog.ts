"use client";

import { useCallback, useId, useRef } from "react";
import { useBodyScrollLock } from "../../hooks/use-body-scroll-lock";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useExitAnimation } from "../../hooks/use-exit-animation";
import { useFocusTrap } from "../../hooks/use-focus-trap";
import { useKeyboardShortcut } from "../../hooks/use-keyboard-shortcut";

export type UseDialogOptions = {
	// State
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	// Behavior
	closeOnBackdropClick?: boolean;
	closeOnEscape?: boolean;
	preventScroll?: boolean;
};

export type UseDialogReturn = {
	// State
	open: boolean;
	setOpen: (open: boolean) => void;
	onOpenChange: (open: boolean) => void;

	// IDs for accessibility
	titleId: string;
	descriptionId: string;

	// Behavior (for content component)
	contentRef: React.RefObject<HTMLDivElement | null>;
	shouldRender: boolean;
	handleBackdropClick: (event: React.MouseEvent) => void;
	dataState: "open" | "closed";

	// Prop getters (for headless usage)
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
		// State options
		defaultOpen = false,
		open: controlledOpen,
		onOpenChange,
		// Behavior options
		closeOnBackdropClick = true,
		closeOnEscape = true,
		preventScroll = true,
	} = options;

	// State management
	const [isOpen, setOpen] = useControllableState({
		value: controlledOpen,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	// IDs for accessibility
	const titleId = useId();
	const descriptionId = useId();

	// Ref for focus trap
	const contentRef = useRef<HTMLDivElement>(null);

	// Behavior: Body scroll lock
	useBodyScrollLock(isOpen && preventScroll);

	// Behavior: Focus trap
	useFocusTrap(contentRef, isOpen);

	// Behavior: Escape key (ignoreInputFields: false so Escape works in form fields)
	useKeyboardShortcut({
		key: "Escape",
		handler: () => setOpen(false),
		enabled: isOpen && closeOnEscape,
		ignoreInputFields: false,
	});

	// Behavior: Exit animation (delays unmount for close animation)
	const shouldRender = useExitAnimation(isOpen, 150);

	// Behavior: Backdrop click handler
	const handleBackdropClick = useCallback(
		(event: React.MouseEvent) => {
			if (closeOnBackdropClick && event.target === event.currentTarget) {
				setOpen(false);
			}
		},
		[closeOnBackdropClick, setOpen]
	);

	// Handlers for prop getters
	const handleOpen = useCallback(() => setOpen(true), [setOpen]);
	const handleClose = useCallback(() => setOpen(false), [setOpen]);

	return {
		// State
		open: isOpen,
		setOpen,
		onOpenChange: setOpen,

		// IDs
		titleId,
		descriptionId,

		// Behavior
		contentRef,
		shouldRender,
		handleBackdropClick,
		dataState: isOpen ? "open" : "closed",

		// Prop getters
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
