// Core components
export { Dropdown } from "./dropdown";
export { DropdownTrigger } from "./dropdown-trigger";
export { DropdownContent } from "./dropdown-content";
export { DropdownItem, DropdownCheckboxItem, DropdownRadioItem } from "./dropdown-item";
export { DropdownGroup, DropdownRadioGroup } from "./dropdown-group";
export { DropdownLabel } from "./dropdown-label";
export { DropdownSeparator } from "./dropdown-separator";
export { DropdownShortcut } from "./dropdown-shortcut";

// Submenu components
export { DropdownSub, DropdownSubTrigger, DropdownSubContent } from "./dropdown-sub";

// Headless hook
export { useDropdown } from "./use-dropdown";

// Context (for advanced customization)
export {
	useDropdownContext,
	useDropdownRadioGroupContext,
	useDropdownSubContext,
	DropdownContext,
	DropdownRadioGroupContext,
	DropdownSubContext,
} from "./dropdown.context";

// Types
export type { DropdownProps } from "./dropdown";
export type {
	DropdownTriggerProps,
	DropdownTriggerRenderProps,
} from "./dropdown-trigger";
export type { DropdownContentProps } from "./dropdown-content";
export type {
	DropdownItemProps,
	DropdownCheckboxItemProps,
	DropdownRadioItemProps,
} from "./dropdown-item";
export type { DropdownGroupProps, DropdownRadioGroupProps } from "./dropdown-group";
export type { DropdownLabelProps } from "./dropdown-label";
export type { DropdownSeparatorProps } from "./dropdown-separator";
export type { DropdownShortcutProps } from "./dropdown-shortcut";
export type {
	DropdownSubProps,
	DropdownSubTriggerProps,
	DropdownSubContentProps,
} from "./dropdown-sub";
export type {
	DropdownContextValue,
	DropdownRadioGroupContextValue,
	DropdownSubContextValue,
} from "./dropdown.context";
export type { UseDropdownOptions, UseDropdownReturn } from "./use-dropdown";

// Variants (for styling customization)
export {
	dropdownContentVariants,
	dropdownItemVariants,
	dropdownLabelVariants,
	dropdownSeparatorVariants,
	dropdownIndicatorVariants,
	dropdownSubTriggerChevronVariants,
	dropdownShortcutVariants,
} from "./dropdown.variants";
