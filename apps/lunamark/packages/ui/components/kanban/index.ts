/**
 * @ui/kanban - Reusable Kanban Board Components
 *
 * A composable set of components for building Kanban boards.
 *
 * @example
 * ```tsx
 * import { Column, ColumnHeader, DroppableZone, EmptyState, DropIndicator } from "@ui/components/kanban";
 *
 * <DroppableZone id={column.id} type="column" accept={["item"]}>
 *   {(isDropTarget) => (
 *     <Column variant={isDropTarget ? "active" : "default"} header={<ColumnHeader title="Todo" count={3} />}>
 *       {tasks.length === 0 ? (
 *         <EmptyState variant={isDropTarget ? "active" : "default"} message="No tasks" />
 *       ) : (
 *         tasks.map((task, index) => (
 *           <TaskCard key={task.id} task={task} index={index}>
 *             <DropIndicator isVisible={isDropTarget} />
 *           </TaskCard>
 *         ))
 *       )}
 *     </Column>
 *   )}
 * </DroppableZone>
 * ```
 */

// Column compound component
export { Column, ColumnHeader } from "./column";
export type { ColumnProps, ColumnHeaderProps } from "./column";
export { columnVariants, columnHeaderVariants, countBadgeVariants } from "./column.variants";

// Backward compatibility - deprecated, use Column instead
export { Column as ColumnContainer } from "./column";
export type { ColumnProps as ColumnContainerProps } from "./column";
export { columnVariants as columnContainerVariants } from "./column.variants";

// TaskCard compound component
export { TaskCard, TaskCardHeader, TaskCardContent, TaskCardFooter } from "./task-card";
export type {
  TaskCardProps,
  TaskCardHeaderProps,
  TaskCardContentProps,
  TaskCardFooterProps,
} from "./task-card";
export {
  taskCardVariants,
  taskCardHeaderVariants,
  taskCardContentVariants,
  taskCardFooterVariants,
} from "./task-card.variants";

// DnD utilities
export { DroppableZone } from "./droppable-zone";
export type { DroppableZoneProps } from "./droppable-zone";

export { DropIndicator } from "./drop-indicator";
export type { DropIndicatorProps } from "./drop-indicator";

// Empty state
export { EmptyState } from "./empty-state";
export type { EmptyStateProps } from "./empty-state";
export { emptyStateVariants } from "./empty-state.variants";
