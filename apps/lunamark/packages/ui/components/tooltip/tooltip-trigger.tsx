"use client";

import type { ReactNode } from "react";
import { useTooltipContext } from "./tooltip.context";

export type TooltipTriggerRenderProps = {
	ref: (node: HTMLElement | null) => void;
	isOpen: boolean;
	"aria-describedby": string | undefined;
} & Record<string, unknown>;

export type TooltipTriggerProps = {
	children: ReactNode | ((props: TooltipTriggerRenderProps) => ReactNode);
};

export function TooltipTrigger({ children }: TooltipTriggerProps) {
	const { refs, getReferenceProps, isOpen, contentId } =
		useTooltipContext("TooltipTrigger");

	const triggerProps: TooltipTriggerRenderProps = {
		ref: refs.setReference,
		isOpen,
		"aria-describedby": isOpen ? contentId : undefined,
		...getReferenceProps(),
	};

	if (typeof children === "function") {
		return children(triggerProps);
	}

	const { isOpen: _isOpen, ...domProps } = triggerProps;
	return <span {...domProps}>{children}</span>;
}
