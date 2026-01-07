"use client";

import type { ComponentProps, ReactNode } from "react";
import { FloatingPortal, FloatingFocusManager } from "@floating-ui/react";
import { cn } from "../../utils/cn";
import { useDropdownContext } from "./dropdown.context";
import { dropdownContentVariants } from "./dropdown.variants";
import { useExitAnimation } from "@ui/hooks/animation/use-exit-animation";

export type DropdownContentProps = {
	children: ReactNode;
	className?: string;
} & Omit<
	ComponentProps<"div">,
	"children" | "className" | "style" | "id" | "role"
>;

function DropdownContent({
	children,
	className,
	...props
}: DropdownContentProps) {
	const {
		isOpen,
		refs,
		floatingStyles,
		getFloatingProps,
		placement,
		contentId,
		floatingContext,
	} = useDropdownContext("DropdownContent");

	const shouldRender = useExitAnimation(isOpen, 150);

	const side = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
	const dataState = isOpen ? "open" : "closed";

	if (!shouldRender) return null;

	return (
		<FloatingPortal>
			<FloatingFocusManager
				context={floatingContext}
				modal={false}
				initialFocus={-1}
			>
				<div
					id={contentId}
					ref={refs.setFloating}
					role="menu"
					data-floating-content
					data-dropdown-content
					data-state={dataState}
					data-side={side}
					style={floatingStyles}
					className={cn(dropdownContentVariants(), className)}
					{...getFloatingProps()}
					{...props}
				>
					{children}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	);
}

export { DropdownContent };
