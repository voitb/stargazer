"use client";

import { useCallback, useRef } from "react";
import { useBodyScrollLock } from "../../hooks/use-body-scroll-lock";
import { useExitAnimation } from "../../hooks/use-exit-animation";
import { useFocusTrap } from "../../hooks/use-focus-trap";
import { useKeyboardShortcut } from "../../hooks/use-keyboard-shortcut";

export type UseDialogBehaviorOptions = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	closeOnBackdropClick?: boolean;
	closeOnEscape?: boolean;
	preventScroll?: boolean;
};

export type UseDialogBehaviorReturn = {
	contentRef: React.RefObject<HTMLDivElement | null>;
	shouldRender: boolean;
	handleBackdropClick: (event: React.MouseEvent) => void;
	dataState: "open" | "closed";
};

export function useDialogBehavior(
	options: UseDialogBehaviorOptions
): UseDialogBehaviorReturn {
	const {
		open,
		onOpenChange,
		closeOnBackdropClick = true,
		closeOnEscape = true,
		preventScroll = true,
	} = options;

	const contentRef = useRef<HTMLDivElement>(null);

	// Reuse existing hooks
	useBodyScrollLock(open && preventScroll);
	useFocusTrap(contentRef, open);

	// Escape key - ignoreInputFields: false so Escape works even in input fields
	useKeyboardShortcut({
		key: "Escape",
		handler: () => onOpenChange(false),
		enabled: open && closeOnEscape,
		ignoreInputFields: false,
	});

	// Exit animation - delays unmount for close animation
	const shouldRender = useExitAnimation(open, 150);

	// Backdrop click handler
	const handleBackdropClick = useCallback(
		(event: React.MouseEvent) => {
			if (closeOnBackdropClick && event.target === event.currentTarget) {
				onOpenChange(false);
			}
		},
		[closeOnBackdropClick, onOpenChange]
	);

	return {
		contentRef,
		shouldRender,
		handleBackdropClick,
		dataState: open ? "open" : "closed",
	};
}
