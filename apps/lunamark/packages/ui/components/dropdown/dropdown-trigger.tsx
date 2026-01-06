"use client";

import type { ReactNode } from "react";
import { useDropdownContext } from "./dropdown.context";

export type DropdownTriggerRenderProps = {
	ref: (node: HTMLElement | null) => void;
	isOpen: boolean;
	"aria-haspopup": "menu";
	"aria-expanded": boolean;
	"aria-controls": string | undefined;
} & Record<string, unknown>;

export type DropdownTriggerProps = {
	children: ReactNode | ((props: DropdownTriggerRenderProps) => ReactNode);
};

function DropdownTrigger({ children }: DropdownTriggerProps) {
	const { refs, getReferenceProps, isOpen, contentId } =
		useDropdownContext("DropdownTrigger");

	const triggerProps: DropdownTriggerRenderProps = {
		ref: refs.setReference,
		isOpen,
		"aria-haspopup": "menu",
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

export { DropdownTrigger };
