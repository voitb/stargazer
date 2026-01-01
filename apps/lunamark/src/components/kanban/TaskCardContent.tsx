import type { Task, TaskPriority } from '@/schemas/task'

/**
 * Priority colors for visual indication
 */
const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
}

interface TaskCardContentProps {
  task: Task
  isDragOverlay?: boolean
}

/**
 * Presentational component for task card content
 *
 * Used by both TaskCard (in-place) and DragOverlay (floating preview)
 * Separating this allows consistent appearance during drag operations
 */
export function TaskCardContent({ task, isDragOverlay }: TaskCardContentProps) {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-3 shadow-sm
        ${isDragOverlay ? 'shadow-lg rotate-3 scale-105' : ''}
      `}
    >
      {/* Title */}
      <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
        {task.metadata.title}
      </h3>

      {/* Priority badge */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span
          className={`
            px-2 py-0.5 rounded text-xs font-medium capitalize
            ${priorityColors[task.metadata.priority]}
          `}
        >
          {task.metadata.priority}
        </span>
      </div>

      {/* Labels */}
      {task.metadata.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.metadata.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {label}
            </span>
          ))}
          {task.metadata.labels.length > 3 && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
              +{task.metadata.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: Assignee and Due Date */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        {task.metadata.assignee && (
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-medium text-gray-600">
              {task.metadata.assignee[0]?.toUpperCase()}
            </span>
            <span>{task.metadata.assignee}</span>
          </span>
        )}
        {task.metadata.due && (
          <span className="text-gray-400">
            {new Date(task.metadata.due).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>
    </div>
  )
}
