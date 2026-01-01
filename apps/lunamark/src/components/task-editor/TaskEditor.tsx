import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import type { Task, TaskStatus, TaskPriority } from '@/schemas/task'

interface TaskEditorProps {
  /** Task to edit, or undefined for create mode */
  task?: Task
  /** Initial status for new tasks */
  initialStatus?: TaskStatus
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal should close */
  onClose: () => void
}

/**
 * Modal component for creating and editing tasks
 *
 * Supports:
 * - Creating new tasks with a form
 * - Editing existing tasks
 * - Deleting tasks with confirmation
 * - Keyboard shortcuts (Escape to close, Cmd+Enter to save)
 */
export function TaskEditor({ task, initialStatus = 'todo', isOpen, onClose }: TaskEditorProps) {
  const isEditing = Boolean(task)

  // Form state
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<TaskStatus>(initialStatus)
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [labels, setLabels] = useState('')
  const [assignee, setAssignee] = useState('')
  const [due, setDue] = useState('')
  const [content, setContent] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Mutations
  const { mutate: createTask, isPending: isCreating } = useCreateTask()
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask()
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask()

  const isPending = isCreating || isUpdating || isDeleting

  // Initialize form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.metadata.title)
      setStatus(task.metadata.status)
      setPriority(task.metadata.priority)
      setLabels(task.metadata.labels.join(', '))
      setAssignee(task.metadata.assignee || '')
      setDue(task.metadata.due || '')
      setContent(task.content)
    } else {
      // Reset for new task
      setTitle('')
      setStatus(initialStatus)
      setPriority('medium')
      setLabels('')
      setAssignee('')
      setDue('')
      setContent('')
    }
    setShowDeleteConfirm(false)
  }, [task, initialStatus, isOpen])

  // Handle save
  const handleSave = useCallback(() => {
    if (!title.trim()) return

    const labelsArray = labels
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)

    if (isEditing && task) {
      updateTask(
        {
          id: task.id,
          title: title.trim(),
          status,
          priority,
          labels: labelsArray,
          assignee: assignee.trim() || null,
          due: due || null,
          content,
        },
        { onSuccess: onClose }
      )
    } else {
      createTask(
        {
          title: title.trim(),
          status,
          priority,
          labels: labelsArray,
          assignee: assignee.trim() || undefined,
          due: due || undefined,
          content,
        },
        { onSuccess: onClose }
      )
    }
  }, [
    title,
    status,
    priority,
    labels,
    assignee,
    due,
    content,
    isEditing,
    task,
    createTask,
    updateTask,
    onClose,
  ])

  // Handle delete
  const handleDelete = useCallback(() => {
    if (!task) return
    deleteTask(task.id, { onSuccess: onClose })
  }, [task, deleteTask, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleSave])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Labels */}
          <div>
            <label htmlFor="labels" className="block text-sm font-medium text-gray-700 mb-1">
              Labels
            </label>
            <input
              id="labels"
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="bug, feature, urgent (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <input
                id="assignee"
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="due" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                id="due"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Markdown)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="## Description&#10;&#10;Add task details..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          {isEditing ? (
            showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Delete this task?</span>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Delete task
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? isEditing
                  ? 'Saving...'
                  : 'Creating...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
