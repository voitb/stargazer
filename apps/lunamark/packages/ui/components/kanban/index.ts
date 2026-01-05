/**
 * @ui/kanban - Reusable Kanban Board Components
 *
 * A composable set of components for building Kanban boards.
 *
 * @example
 * ```tsx
 * import { ColumnContainer, DroppableZone, EmptyState, DropIndicator } from "@ui/components/kanban";
 *
 * <DroppableZone id={column.id} type="column" accept={["item"]}>
 *   {(isDropTarget) => (
 *     <ColumnContainer variant={isDropTarget ? "active" : "default"} header={<ColumnHeader />}>
 *       {tasks.length === 0 ? (
 *         <EmptyState variant={isDropTarget ? "active" : "default"} message="No tasks" />
 *       ) : (
 *         tasks.map((task, index) => (
 *           <TaskCard key={task.id} task={task} index={index}>
 *             <DropIndicator isVisible={isDropTarget} />
 *           </TaskCard>
 *         ))
 *       )}
 *     </ColumnContainer>
 *   )}
 * </DroppableZone>
 * ```
 */

// Column Container
export { ColumnContainer } from "./column-container";
export type { ColumnContainerProps } from "./column-container";
export { columnContainerVariants } from "./column-container";

// Droppable Zone (DnD wrapper)
export { DroppableZone } from "./droppable-zone";
export type { DroppableZoneProps } from "./droppable-zone";

// Drop Indicator
export { DropIndicator } from "./drop-indicator";
export type { DropIndicatorProps } from "./drop-indicator";

// Empty State
export { EmptyState } from "./empty-state";
export type { EmptyStateProps } from "./empty-state";
export { emptyStateVariants } from "./empty-state";

// Column Header
export { ColumnHeader } from "./column-header";
export type { ColumnHeaderProps } from "./column-header";
export { columnHeaderVariants, countBadgeVariants } from "./column-header";
