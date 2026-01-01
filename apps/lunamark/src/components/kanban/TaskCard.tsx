import { useSortable } from '@dnd-kit/react/sortable'
import type { Task, TaskPriority } from '@/schemas/task'
import { DropIndicator } from './DropIndicator'

interface TaskCardProps {
  task: Task
  column: string
  /** Array index within the column (not task.metadata.order) */
  index: number
  /** Whether this is the last task in the column (shows bottom drop indicator) */
  isLast?: boolean
  /** Callback when the card is clicked (for editing) */
  onClick?: () => void
}

/**
 * Priority colors for visual indication
 */
const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
}

/**
 * Draggable task card for the Kanban board
 *
 * Uses @dnd-kit/react for accessible drag-and-drop.
 * The index prop should be the position in the column's task array,
 * NOT task.metadata.order (which is for persistence sorting).
 */
export function TaskCard({ task, column, index, isLast, onClick }: TaskCardProps) {
  const { ref, isDragging, isDropTarget } = useSortable({
    id: task.id,
    index, // Use actual array position, not metadata.order
    group: column,
    type: 'item',
    accept: ['item'],
    data: { task, column },
  })

  return (
    <div ref={ref}>
      <DropIndicator isVisible={isDropTarget} />
      <div
        onClick={onClick}
        className={`
          bg-white rounded-lg border border-gray-200 p-3 shadow-sm
          cursor-grab active:cursor-grabbing
          transition-all duration-200
          hover:shadow-md hover:border-gray-300
          ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-blue-400' : ''}
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
      {/* Show bottom drop indicator for last item in column */}
      {isLast && <DropIndicator isVisible={isDropTarget && !isDragging} />}
    </div>
  )
}
