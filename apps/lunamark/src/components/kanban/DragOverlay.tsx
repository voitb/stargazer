import type { Task } from '@/schemas/task'
import { TaskCardContent } from './TaskCardContent'

interface KanbanDragOverlayProps {
  activeTask: Task | null
}

/**
 * Floating drag preview for Kanban cards
 *
 * Renders a styled copy of the task being dragged.
 * Uses TaskCardContent for consistent appearance.
 *
 * Note: @dnd-kit/react v0.2+ handles drag overlay internally
 * through the sortable system. This component provides
 * a visual indicator of the active drag state.
 */
export function KanbanDragOverlay({ activeTask }: KanbanDragOverlayProps) {
  if (!activeTask) return null

  return (
    <div className="fixed pointer-events-none z-50">
      <TaskCardContent task={activeTask} isDragOverlay />
    </div>
  )
}
