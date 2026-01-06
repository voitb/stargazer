// Components
export { Tooltip } from "./tooltip";
export { TooltipTrigger } from "./tooltip-trigger";
export { TooltipContent } from "./tooltip-content";

// Headless hook (for advanced usage)
export { useTooltip } from "./use-tooltip";

// Context (for advanced customization)
export { useTooltipContext, TooltipContext } from "./tooltip.context";

// Variants
export { tooltipContentVariants } from "./tooltip.variants";

// Types
export type { TooltipProps } from "./tooltip";
export type {
	TooltipTriggerProps,
	TooltipTriggerRenderProps,
} from "./tooltip-trigger";
export type { TooltipContentProps } from "./tooltip-content";
export type { UseTooltipOptions, UseTooltipReturn } from "./use-tooltip";
export type { TooltipContextValue } from "./tooltip.context";
export type { TooltipContentVariants } from "./tooltip.variants";
