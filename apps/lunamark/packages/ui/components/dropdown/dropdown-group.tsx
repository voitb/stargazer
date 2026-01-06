"use client";

import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import { cn } from "../../utils/cn";
import { DropdownRadioGroupContext } from "./dropdown.context";
import { useControllableState } from "../../hooks/use-controllable-state";

// ============================================================================
// DropdownGroup - Simple grouping container
// ============================================================================

export type DropdownGroupProps = {
	children: ReactNode;
	className?: string;
	label?: string;
} & Omit<ComponentProps<"div">, "children" | "className" | "role">;

function DropdownGroup({
	children,
	className,
	label,
	...props
}: DropdownGroupProps) {
	return (
		<div
			role="group"
			aria-label={label}
			className={cn(className)}
			{...props}
		>
			{children}
		</div>
	);
}

// ============================================================================
// DropdownRadioGroup - Radio group container
// ============================================================================

export type DropdownRadioGroupProps = {
	children: ReactNode;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	className?: string;
	label?: string;
} & Omit<ComponentProps<"div">, "children" | "className" | "role">;

function DropdownRadioGroup({
	children,
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	className,
	label,
	...props
}: DropdownRadioGroupProps) {
	const [value, setValue] = useControllableState({
		value: controlledValue,
		defaultValue,
		onChange: onValueChange,
	});

	const contextValue = useMemo(
		() => ({
			value,
			onValueChange: setValue,
		}),
		[value, setValue]
	);

	return (
		<DropdownRadioGroupContext.Provider value={contextValue}>
			<div
				role="group"
				aria-label={label}
				className={cn(className)}
				{...props}
			>
				{children}
			</div>
		</DropdownRadioGroupContext.Provider>
	);
}

export { DropdownGroup, DropdownRadioGroup };
