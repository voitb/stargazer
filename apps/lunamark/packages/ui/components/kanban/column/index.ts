// Components
export { Column } from "./column";
export { ColumnHeader } from "./column-header";
export { ColumnContent } from "./column-content";
export { ColumnFooter } from "./column-footer";

// Headless hook
export { useColumn } from "./use-column";

// Context (for advanced customization)
export { useColumnContext, ColumnContext } from "./column.context";

// Types
export type { ColumnProps } from "./column";
export type { ColumnHeaderProps } from "./column-header";
export type { ColumnContentProps } from "./column-content";
export type { ColumnFooterProps } from "./column-footer";
export type { UseColumnOptions, UseColumnReturn } from "./use-column";
export type { ColumnContextValue } from "./column.context";

// Variants (for styling customization)
export {
	columnVariants,
	columnHeaderVariants,
	columnContentVariants,
	columnFooterVariants,
	countBadgeVariants,
} from "./column.variants";
