// Core components
export { Popover } from "./popover";
export { PopoverTrigger } from "./popover-trigger";
export { PopoverContent } from "./popover-content";
export { PopoverClose } from "./popover-close";

// Headless hook
export { usePopover } from "./use-popover";

// Context (for advanced customization)
export { usePopoverContext, PopoverContext } from "./popover.context";

// Types
export type { PopoverProps } from "./popover";
export type {
	PopoverTriggerProps,
	PopoverTriggerRenderProps,
} from "./popover-trigger";
export type { PopoverContentProps } from "./popover-content";
export type { PopoverCloseProps } from "./popover-close";
export type { PopoverContextValue } from "./popover.context";
export type { UsePopoverOptions, UsePopoverReturn } from "./use-popover";

// Variants (for styling customization)
export { popoverContentVariants, popoverCloseVariants } from "./popover.variants";
