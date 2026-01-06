"use client";

import { useEffect } from "react";

/**
 * Locks body scroll when active.
 * Handles scrollbar width to prevent layout shift.
 */
export function useBodyScrollLock(isLocked: boolean): void {
	useEffect(() => {
		if (!isLocked) return;

		const originalOverflow = document.body.style.overflow;
		const originalPaddingRight = document.body.style.paddingRight;

		// Calculate scrollbar width to prevent layout shift
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth;

		document.body.style.overflow = "hidden";
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		}

		return () => {
			document.body.style.overflow = originalOverflow;
			document.body.style.paddingRight = originalPaddingRight;
		};
	}, [isLocked]);
}
