"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useToggleGroupContext } from "./toggle-group.context";
import {
	toggleGroupItemVariants,
	toggleGroupItemSelectedVariants,
} from "./toggle-group.variants";

export type ToggleGroupItemProps = Omit<ComponentProps<"button">, "value"> & {
	value: string;
	children: ReactNode;
};

function ToggleGroupItem({
	value,
	children,
	className,
	ref,
	...props
}: ToggleGroupItemProps) {
	const {
		size,
		variant,
		registerItem,
		unregisterItem,
		isItemSelected,
		onItemToggle,
		value: groupValue,
		values: groupValues,
		type,
	} = useToggleGroupContext();

	const buttonRef = useRef<HTMLButtonElement>(null);
	const isSelected = isItemSelected(value);

	useEffect(() => {
		const element = buttonRef.current;
		if (element) {
			registerItem(value, element);
		}
		return () => unregisterItem(value);
	}, [value, registerItem, unregisterItem]);

	const combinedRef = (node: HTMLButtonElement | null) => {
		buttonRef.current = node;
		if (typeof ref === "function") {
			ref(node);
		} else if (ref) {
			(ref as React.RefObject<HTMLButtonElement | null>).current = node;
		}
	};

	const isFirstFocusable =
		type === "single"
			? groupValue === null || groupValue === value
			: groupValues.length === 0 || groupValues[0] === value;

	const tabIndex = isSelected || isFirstFocusable ? 0 : -1;

	const ariaProps =
		type === "single"
			? { role: "radio" as const, "aria-checked": isSelected }
			: { "aria-pressed": isSelected };

	return (
		<button
			ref={combinedRef}
			type="button"
			{...ariaProps}
			data-state={isSelected ? "on" : "off"}
			tabIndex={tabIndex}
			onClick={() => onItemToggle(value)}
			className={cn(
				toggleGroupItemVariants({ size, variant }),
				isSelected && toggleGroupItemSelectedVariants[variant],
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export { ToggleGroupItem };
