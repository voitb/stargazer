import type { Task, TaskStatus } from '@/schemas/task'

export interface DragState {
  activeTask: Task | null
  isDragging: boolean
}

export interface BoardState {
  items: Record<TaskStatus, string[]>
  tasksMap: Map<string, Task>
}

export interface DragHandlers {
  handleDragStart: (event: DragEvent) => void
  handleDragOver: (event: DragEvent) => void
  handleDragEnd: (event: DragEvent) => void
}

// Re-export for convenience
export type { Task, TaskStatus }
