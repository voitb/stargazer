// Components
export { ToggleGroup } from "./toggle-group";
export { ToggleGroupItem } from "./toggle-group-item";

// Types
export type { ToggleGroupProps } from "./toggle-group";
export type { ToggleGroupItemProps } from "./toggle-group-item";

// Hook (for headless usage)
export { useToggleGroup } from "./use-toggle-group";
export type {
	UseToggleGroupOptions,
	UseToggleGroupReturn,
} from "./use-toggle-group";

// Context (for advanced customization)
export {
	useToggleGroupContext,
	ToggleGroupContext,
} from "./toggle-group.context";
export type { ToggleGroupContextValue } from "./toggle-group.context";

// Variants (for styling customization)
export {
	toggleGroupVariants,
	toggleGroupItemVariants,
	toggleGroupItemSelectedVariants,
} from "./toggle-group.variants";
