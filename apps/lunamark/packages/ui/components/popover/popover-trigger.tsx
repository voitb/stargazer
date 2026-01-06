"use client";

import type { ReactNode } from "react";
import { usePopoverContext } from "./popover.context";

export type PopoverTriggerRenderProps = {
	ref: (node: HTMLElement | null) => void;
	isOpen: boolean;
	"aria-haspopup": "dialog";
	"aria-expanded": boolean;
	"aria-controls": string | undefined;
} & Record<string, unknown>;

export type PopoverTriggerProps = {
	children: ReactNode | ((props: PopoverTriggerRenderProps) => ReactNode);
};

function PopoverTrigger({ children }: PopoverTriggerProps) {
	const { refs, getReferenceProps, isOpen, contentId } =
		usePopoverContext("PopoverTrigger");

	const triggerProps: PopoverTriggerRenderProps = {
		ref: refs.setReference,
		isOpen,
		"aria-haspopup": "dialog",
		"aria-expanded": isOpen,
		"aria-controls": isOpen ? contentId : undefined,
		...getReferenceProps(),
	};

	if (typeof children === "function") {
		return children(triggerProps);
	}

	// Destructure isOpen to avoid passing it to the DOM element
	const { isOpen: _isOpen, ...domProps } = triggerProps;

	return (
		<button type="button" {...domProps}>
			{children}
		</button>
	);
}

export { PopoverTrigger };
