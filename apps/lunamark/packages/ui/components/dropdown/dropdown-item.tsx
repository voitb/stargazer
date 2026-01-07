"use client";

import type { ComponentProps, ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "../../utils/cn";
import {
	useDropdownContext,
	useDropdownRadioGroupContext,
	useDropdownSubContext,
} from "./dropdown.context";
import {
	dropdownItemVariants,
	dropdownIndicatorVariants,
} from "./dropdown.variants";
import { useControllableState } from "../../hooks/use-controllable-state";
import { CheckIcon, DotIcon } from "../icons";

export type DropdownItemProps = {
	children: ReactNode;
	onSelect?: () => void;
	disabled?: boolean;
	destructive?: boolean;
	inset?: boolean;
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
>;

function DropdownItem({
	children,
	onSelect,
	disabled = false,
	destructive = false,
	inset = false,
	className,
	textValue,
	...props
}: DropdownItemProps) {
	const subContext = useDropdownSubContext();
	const mainContext = useDropdownContext("DropdownItem");

	const context = subContext
		? {
				setIsOpen: subContext.setIsOpen,
				activeIndex: subContext.activeIndex,
				listRef: subContext.listRef,
				labelsRef: subContext.labelsRef,
				getItemProps: subContext.getSubItemProps,
			}
		: {
				setIsOpen: mainContext.setIsOpen,
				activeIndex: mainContext.activeIndex,
				listRef: mainContext.listRef,
				labelsRef: mainContext.labelsRef,
				getItemProps: mainContext.getItemProps,
			};

	const { setIsOpen, activeIndex, listRef, labelsRef, getItemProps } = context;

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

	const handleSelect = useCallback(() => {
		if (disabled) return;
		onSelect?.();
		setIsOpen(false);
		if (subContext) {
			subContext.closeParent();
		}
	}, [disabled, onSelect, setIsOpen, subContext]);

	return (
		<button
			ref={refCallback}
			type="button"
			role="menuitem"
			tabIndex={isHighlighted ? 0 : -1}
			disabled={disabled}
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
			{...getItemProps({
				active: isHighlighted,
				onClick: handleSelect,
			})}
			{...props}
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
	disabled?: boolean;
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
>;

function DropdownCheckboxItem({
	children,
	checked: controlledChecked,
	defaultChecked = false,
	onCheckedChange,
	disabled = false,
	className,
	textValue,
	...props
}: DropdownCheckboxItemProps) {
	const { activeIndex, listRef, labelsRef, getItemProps } =
		useDropdownContext("DropdownCheckboxItem");

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

	const handleToggle = useCallback(() => {
		if (disabled) return;
		setIsChecked(!isChecked);
	}, [disabled, isChecked, setIsChecked]);

	return (
		<button
			ref={refCallback}
			type="button"
			role="menuitemcheckbox"
			aria-checked={isChecked}
			tabIndex={isHighlighted ? 0 : -1}
			disabled={disabled}
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
			{...getItemProps({
				active: isHighlighted,
				onClick: handleToggle,
			})}
			{...props}
		>
			<span
				className={cn(dropdownIndicatorVariants())}
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
	disabled?: boolean;
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
>;

function DropdownRadioItem({
	children,
	value,
	disabled = false,
	className,
	textValue,
	...props
}: DropdownRadioItemProps) {
	const { activeIndex, listRef, labelsRef, getItemProps } =
		useDropdownContext("DropdownRadioItem");

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

	const handleSelect = useCallback(() => {
		if (disabled) return;
		onValueChange(value);
	}, [disabled, onValueChange, value]);

	return (
		<button
			ref={refCallback}
			type="button"
			role="menuitemradio"
			aria-checked={isSelected}
			tabIndex={isHighlighted ? 0 : -1}
			disabled={disabled}
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
			{...getItemProps({
				active: isHighlighted,
				onClick: handleSelect,
			})}
			{...props}
		>
			<span
				className={cn(dropdownIndicatorVariants())}
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
