"use client";

import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import { FloatingPortal, FloatingFocusManager } from "@floating-ui/react";
import { cn, mergeRefs } from "@ui/utils";
import { DropdownListContext, useDropdownContext } from "./dropdown.context";
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
	ref,
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
		activeIndex,
		listRef,
		labelsRef,
		getItemProps,
		setIsOpen,
	} = useDropdownContext("DropdownContent");

	const shouldRender = useExitAnimation(isOpen, 150);

	const side = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
	const dataState = isOpen ? "open" : "closed";
	const listContextValue = useMemo(
		() => ({
			activeIndex,
			listRef,
			labelsRef,
			getItemProps,
			closeMenu: () => setIsOpen(false),
		}),
		[activeIndex, listRef, labelsRef, getItemProps, setIsOpen]
	);
	const combinedRef = mergeRefs(refs.setFloating, ref);
	const floatingProps = getFloatingProps(props);
	const contentClassName = cn(
		"z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
		"bg-[rgb(var(--color-neutral-background-1))]",
		"text-[rgb(var(--color-neutral-foreground-1))]",
		"border-[rgb(var(--color-neutral-stroke-1))]",
		className
	);

	if (!shouldRender) return null;

	return (
		<FloatingPortal>
			<FloatingFocusManager
				context={floatingContext}
				modal={false}
				initialFocus={-1}
			>
				<DropdownListContext.Provider value={listContextValue}>
					<div
						id={contentId}
						ref={combinedRef}
						role="menu"
						data-floating-content
						data-dropdown-content
						data-state={dataState}
						data-side={side}
						style={floatingStyles}
						className={contentClassName}
						{...floatingProps}
					>
						{children}
					</div>
				</DropdownListContext.Provider>
			</FloatingFocusManager>
		</FloatingPortal>
	);
}

export { DropdownContent };
