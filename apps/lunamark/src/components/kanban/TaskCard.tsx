import { useSortable } from '@dnd-kit/react/sortable'
import type { Task } from '@/schemas/task'
import { DropIndicator } from './DropIndicator'
import { TaskCardContent } from './TaskCardContent'

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

export function TaskCard({ task, column, index, isLast, onClick }: TaskCardProps) {
  const { ref, isDragging, isDropTarget } = useSortable({
    id: task.id,
    index,
    group: column,
    type: 'item',
    accept: ['item'],
    data: { task, column },
  })

  return (
    <div ref={ref}>
      <DropIndicator isVisible={isDropTarget} />
      <TaskCardContent
        task={task}
        onClick={onClick}
        className={isDragging ? 'opacity-50 shadow-lg ring-2 ring-blue-400' : ''}
      />
      {/* Show bottom drop indicator for last item in column */}
      {isLast && <DropIndicator isVisible={isDropTarget && !isDragging} />}
    </div>
  )
}
