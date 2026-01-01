import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTask, updateTask, deleteTask, moveTask } from '../server/tasks'
import { BOARD_QUERY_KEY } from './useBoard'
import type {
  Task,
  Board,
  Column,
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
} from '@/schemas/task'

/** Context type for optimistic updates with rollback */
type MutationContext = { previousBoard: Board | undefined }

/**
 * Hook for creating a new task
 *
 * Provides optimistic updates - the task appears immediately in the UI
 * while the server request is in flight. On error, changes are rolled back.
 *
 * @example
 * ```tsx
 * const { mutate: create, isPending } = useCreateTask()
 *
 * create({
 *   title: 'New feature',
 *   status: 'todo',
 *   priority: 'high',
 * })
 * ```
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask({ data: input }),

    onMutate: async (newTask: CreateTaskInput): Promise<MutationContext> => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY })

      // Snapshot the previous value
      const previousBoard = queryClient.getQueryData<Board>(BOARD_QUERY_KEY)

      // Optimistically update the cache
      if (previousBoard) {
        const optimisticTask: Task = {
          id: `temp-${Date.now()}`,
          filePath: '',
          metadata: {
            id: `temp-${Date.now()}`,
            title: newTask.title,
            status: newTask.status ?? 'todo',
            priority: newTask.priority ?? 'medium',
            labels: newTask.labels ?? [],
            assignee: newTask.assignee ?? null,
            created: new Date().toISOString().split('T')[0],
            due: newTask.due ?? null,
            order: 0,
          },
          content: newTask.content ?? '',
        }

        const newBoard: Board = {
          ...previousBoard,
          columns: previousBoard.columns.map((col: Column) =>
            col.id === (newTask.status ?? 'todo')
              ? { ...col, tasks: [optimisticTask, ...col.tasks] }
              : col
          ),
        }

        queryClient.setQueryData(BOARD_QUERY_KEY, newBoard)
      }

      return { previousBoard }
    },

    onError: (_err: Error, _newTask: CreateTaskInput, context: MutationContext | undefined) => {
      // Rollback on error
      if (context?.previousBoard) {
        queryClient.setQueryData(BOARD_QUERY_KEY, context.previousBoard)
      }
    },

    onSettled: () => {
      // Refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
    },
  })
}

/**
 * Hook for updating an existing task
 *
 * Provides optimistic updates for immediate feedback.
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTask({ data: input }),

    onMutate: async (updatedTask: UpdateTaskInput): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY })
      const previousBoard = queryClient.getQueryData<Board>(BOARD_QUERY_KEY)

      if (previousBoard) {
        const newBoard: Board = {
          ...previousBoard,
          columns: previousBoard.columns.map((col: Column) => ({
            ...col,
            tasks: col.tasks.map((task: Task) =>
              task.id === updatedTask.id
                ? {
                    ...task,
                    metadata: { ...task.metadata, ...updatedTask },
                    content: updatedTask.content ?? task.content,
                  }
                : task
            ),
          })),
        }

        queryClient.setQueryData(BOARD_QUERY_KEY, newBoard)
      }

      return { previousBoard }
    },

    onError: (_err: Error, _updatedTask: UpdateTaskInput, context: MutationContext | undefined) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(BOARD_QUERY_KEY, context.previousBoard)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
    },
  })
}

/**
 * Hook for deleting a task
 *
 * Immediately removes the task from the UI, rolls back if server fails.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => deleteTask({ data: { taskId } }),

    onMutate: async (taskId: string): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY })
      const previousBoard = queryClient.getQueryData<Board>(BOARD_QUERY_KEY)

      if (previousBoard) {
        const newBoard: Board = {
          ...previousBoard,
          columns: previousBoard.columns.map((col: Column) => ({
            ...col,
            tasks: col.tasks.filter((task: Task) => task.id !== taskId),
          })),
        }

        queryClient.setQueryData(BOARD_QUERY_KEY, newBoard)
      }

      return { previousBoard }
    },

    onError: (_err: Error, _taskId: string, context: MutationContext | undefined) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(BOARD_QUERY_KEY, context.previousBoard)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
    },
  })
}

/**
 * Hook for moving a task between columns
 *
 * Used for drag-and-drop operations. Updates status and order.
 * Optimistic update happens immediately for smooth drag experience.
 */
export function useMoveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: MoveTaskInput) => moveTask({ data: input }),

    onMutate: async (moveData: MoveTaskInput): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY })
      const previousBoard = queryClient.getQueryData<Board>(BOARD_QUERY_KEY)

      if (previousBoard) {
        // Find the task being moved
        let movedTask: Task | undefined
        for (const col of previousBoard.columns) {
          movedTask = col.tasks.find((t: Task) => t.id === moveData.taskId)
          if (movedTask) break
        }

        if (movedTask) {
          const updatedTask: Task = {
            ...movedTask,
            metadata: {
              ...movedTask.metadata,
              status: moveData.newStatus,
              order: moveData.newOrder,
            },
          }

          const newBoard: Board = {
            ...previousBoard,
            columns: previousBoard.columns.map((col: Column) => {
              // Remove task from all columns
              const filteredTasks = col.tasks.filter((t: Task) => t.id !== moveData.taskId)

              // Add task to target column
              if (col.id === moveData.newStatus) {
                // Insert at correct position based on order
                const tasksWithNew = [...filteredTasks, updatedTask]
                tasksWithNew.sort((a, b) => a.metadata.order - b.metadata.order)
                return { ...col, tasks: tasksWithNew }
              }

              return { ...col, tasks: filteredTasks }
            }),
          }

          queryClient.setQueryData(BOARD_QUERY_KEY, newBoard)
        }
      }

      return { previousBoard }
    },

    onError: (_err: Error, _moveData: MoveTaskInput, context: MutationContext | undefined) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(BOARD_QUERY_KEY, context.previousBoard)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
    },
  })
}
