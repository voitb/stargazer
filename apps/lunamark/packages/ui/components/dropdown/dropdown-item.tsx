"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { cn, mergeRefs } from "@ui/utils";
import {
	useDropdownListContext,
	useDropdownRadioGroupContext,
} from "./dropdown.context";
import { dropdownItemVariants } from "./dropdown.variants";
import { useControllableState } from "@ui/hooks/state/use-controllable-state";
import { CheckIcon, DotIcon } from "../icons";

type DropdownItemVariantProps = VariantProps<typeof dropdownItemVariants>;

export type DropdownItemProps = {
	children: ReactNode;
	onSelect?: () => void;
	destructive?: boolean;
	className?: string;
	textValue?: string;
} & Omit<
	ComponentProps<"button">,
	| "children"
	| "className"
	| "onClick"
	| "disabled"
	| "type"
	| "role"
	| "tabIndex"
> &
	Omit<DropdownItemVariantProps, "variant" | "highlighted">;

function DropdownItem({
	children,
	onSelect,
	disabled = false,
	destructive = false,
	inset = false,
	className,
	textValue,
	ref,
	...props
}: DropdownItemProps) {
	const { activeIndex, listRef, labelsRef, getItemProps, closeMenu } =
		useDropdownListContext("DropdownItem");

	const itemRef = useRef<HTMLButtonElement>(null);
	const index = useRef<number>(-1);

	const refCallback = useCallback(
		(node: HTMLButtonElement | null) => {
			itemRef.current = node;
			if (node) {
				const currentIndex = listRef.current.indexOf(node);
				if (currentIndex === -1) {
					index.current = listRef.current.length;
					listRef.current.push(node);
					labelsRef.current.push(textValue ?? node.textContent);
				} else {
					index.current = currentIndex;
				}
			}
		},
		[listRef, labelsRef, textValue]
	);
	const combinedRef = mergeRefs(refCallback, ref);

	useEffect(() => {
		return () => {
			if (itemRef.current) {
				const idx = listRef.current.indexOf(itemRef.current);
				if (idx !== -1) {
					listRef.current.splice(idx, 1);
					labelsRef.current.splice(idx, 1);
				}
			}
		};
	}, [listRef, labelsRef]);

	const isHighlighted = activeIndex === index.current;

	const handleSelect = () => {
		if (disabled) return;
		onSelect?.();
		closeMenu();
	};

	const itemProps = getItemProps({
		active: isHighlighted,
		onClick: handleSelect,
		...props,
	});

	return (
		<button
			ref={combinedRef}
			type="button"
			role="menuitem"
			data-dropdown-item
			data-highlighted={isHighlighted}
			data-disabled={disabled}
			className={cn(
				dropdownItemVariants({
					variant: destructive ? "destructive" : "default",
					highlighted: isHighlighted,
					disabled,
					inset,
				}),
				className
			)}
			{...itemProps}
			disabled={disabled || undefined}
			tabIndex={isHighlighted ? 0 : -1}
		>
			{children}
		</button>
	);
}

export type DropdownCheckboxItemProps = {
	children: ReactNode;
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	className?: string;
	textValue?: string;
} & Omit<
	ComponentProps<"button">,
	| "children"
	| "className"
	| "onClick"
	| "disabled"
	| "type"
	| "role"
	| "tabIndex"
> &
	Omit<DropdownItemVariantProps, "variant" | "highlighted" | "inset">;

function DropdownCheckboxItem({
	children,
	checked: controlledChecked,
	defaultChecked = false,
	onCheckedChange,
	disabled = false,
	className,
	textValue,
	ref,
	...props
}: DropdownCheckboxItemProps) {
	const { activeIndex, listRef, labelsRef, getItemProps } =
		useDropdownListContext("DropdownCheckboxItem");

	const [isChecked, setIsChecked] = useControllableState({
		value: controlledChecked,
		defaultValue: defaultChecked,
		onChange: onCheckedChange,
	});

	const itemRef = useRef<HTMLButtonElement>(null);
	const index = useRef<number>(-1);

	const refCallback = useCallback(
		(node: HTMLButtonElement | null) => {
			itemRef.current = node;
			if (node) {
				const currentIndex = listRef.current.indexOf(node);
				if (currentIndex === -1) {
					index.current = listRef.current.length;
					listRef.current.push(node);
					labelsRef.current.push(textValue ?? node.textContent);
				} else {
					index.current = currentIndex;
				}
			}
		},
		[listRef, labelsRef, textValue]
	);
	const combinedRef = mergeRefs(refCallback, ref);

	useEffect(() => {
		return () => {
			if (itemRef.current) {
				const idx = listRef.current.indexOf(itemRef.current);
				if (idx !== -1) {
					listRef.current.splice(idx, 1);
					labelsRef.current.splice(idx, 1);
				}
			}
		};
	}, [listRef, labelsRef]);

	const isHighlighted = activeIndex === index.current;

	const handleToggle = () => {
		if (disabled) return;
		setIsChecked(!isChecked);
	};

	const itemProps = getItemProps({
		active: isHighlighted,
		onClick: handleToggle,
		...props,
	});

	return (
		<button
			ref={combinedRef}
			type="button"
			role="menuitemcheckbox"
			aria-checked={isChecked ?? undefined}
			data-dropdown-item
			data-dropdown-checkbox-item
			data-highlighted={isHighlighted}
			data-disabled={disabled}
			data-state={isChecked ? "checked" : "unchecked"}
			className={cn(
				dropdownItemVariants({
					highlighted: isHighlighted,
					disabled,
					inset: true,
				}),
				className
			)}
			{...itemProps}
			disabled={disabled || undefined}
			tabIndex={isHighlighted ? 0 : -1}
		>
			<span
				className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
				data-dropdown-item-indicator
				data-state={isChecked ? "checked" : "unchecked"}
			>
				{isChecked && <CheckIcon className="h-4 w-4" />}
			</span>
			{children}
		</button>
	);
}

export type DropdownRadioItemProps = {
	children: ReactNode;
	value: string;
	className?: string;
	textValue?: string;
} & Omit<
	ComponentProps<"button">,
	| "children"
	| "className"
	| "onClick"
	| "disabled"
	| "type"
	| "role"
	| "tabIndex"
	| "value"
> &
	Omit<DropdownItemVariantProps, "variant" | "highlighted" | "inset">;

function DropdownRadioItem({
	children,
	value,
	disabled = false,
	className,
	textValue,
	ref,
	...props
}: DropdownRadioItemProps) {
	const { activeIndex, listRef, labelsRef, getItemProps } =
		useDropdownListContext("DropdownRadioItem");

	const { value: selectedValue, onValueChange } =
		useDropdownRadioGroupContext("DropdownRadioItem");

	const isSelected = value === selectedValue;

	const itemRef = useRef<HTMLButtonElement>(null);
	const index = useRef<number>(-1);

	const refCallback = useCallback(
		(node: HTMLButtonElement | null) => {
			itemRef.current = node;
			if (node) {
				const currentIndex = listRef.current.indexOf(node);
				if (currentIndex === -1) {
					index.current = listRef.current.length;
					listRef.current.push(node);
					labelsRef.current.push(textValue ?? node.textContent);
				} else {
					index.current = currentIndex;
				}
			}
		},
		[listRef, labelsRef, textValue]
	);
	const combinedRef = mergeRefs(refCallback, ref);

	useEffect(() => {
		return () => {
			if (itemRef.current) {
				const idx = listRef.current.indexOf(itemRef.current);
				if (idx !== -1) {
					listRef.current.splice(idx, 1);
					labelsRef.current.splice(idx, 1);
				}
			}
		};
	}, [listRef, labelsRef]);

	const isHighlighted = activeIndex === index.current;

	const handleSelect = () => {
		if (disabled) return;
		onValueChange(value);
	};

	const itemProps = getItemProps({
		active: isHighlighted,
		onClick: handleSelect,
		...props,
	});

	return (
		<button
			ref={combinedRef}
			type="button"
			role="menuitemradio"
			aria-checked={isSelected}
			data-dropdown-item
			data-dropdown-radio-item
			data-highlighted={isHighlighted}
			data-disabled={disabled}
			data-state={isSelected ? "checked" : "unchecked"}
			className={cn(
				dropdownItemVariants({
					highlighted: isHighlighted,
					disabled,
					inset: true,
				}),
				className
			)}
			{...itemProps}
			disabled={disabled || undefined}
			tabIndex={isHighlighted ? 0 : -1}
		>
			<span
				className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
				data-dropdown-item-indicator
				data-state={isSelected ? "checked" : "unchecked"}
			>
				{isSelected && <DotIcon className="h-2 w-2" />}
			</span>
			{children}
		</button>
	);
}

export { DropdownItem, DropdownCheckboxItem, DropdownRadioItem };
