import * as fs from 'node:fs'
import * as path from 'node:path'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { loadTaskById, findTaskFilePath } from '../lib/board-loader'
import { serializeTask, generateFilename } from '../lib/task-parser'
import { resolveConfigSync, getTasksDir } from '../lib/config'
import {
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  MoveTaskInputSchema,
  type Task,
} from '@/schemas/task'

/**
 * Create a new task
 *
 * Generates a unique ID, creates a markdown file with YAML frontmatter,
 * and returns the created task.
 */
export const createTask = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CreateTaskInputSchema.parse(data))
  .handler(async ({ data }): Promise<Task> => {
    const config = resolveConfigSync()
    const tasksDir = getTasksDir(config)

    // Generate unique ID
    const id = `task-${nanoid(8)}`

    // Build task metadata
    const metadata = {
      id,
      title: data.title,
      status: data.status,
      priority: data.priority,
      labels: data.labels,
      assignee: data.assignee,
      created: new Date().toISOString().split('T')[0],
      due: data.due,
      order: 0, // New tasks go to the top
    }

    // Create task object
    const task: Task = {
      id,
      filePath: '', // Will be set below
      metadata,
      content: data.content,
    }

    // Generate filename and path
    const filename = generateFilename(id, data.title)
    const filePath = path.join(tasksDir, filename)
    task.filePath = filePath

    // Serialize and write to file
    const markdown = serializeTask(task)
    await fs.promises.writeFile(filePath, markdown, 'utf-8')

    return task
  })

/**
 * Update an existing task
 *
 * Updates the markdown file with new metadata and/or content.
 * Only provided fields are updated; others remain unchanged.
 */
export const updateTask = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateTaskInputSchema.parse(data))
  .handler(async ({ data }): Promise<Task> => {
    const config = resolveConfigSync()
    const tasksDir = getTasksDir(config)

    // Load existing task
    const existingTask = await loadTaskById(tasksDir, data.id)
    if (!existingTask) {
      throw new Error(`Task not found: ${data.id}`)
    }

    // Merge updates with existing task
    const updatedTask: Task = {
      ...existingTask,
      metadata: {
        ...existingTask.metadata,
        ...(data.title !== undefined && { title: data.title }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.labels !== undefined && { labels: data.labels }),
        ...(data.assignee !== undefined && { assignee: data.assignee }),
        ...(data.due !== undefined && { due: data.due }),
        ...(data.order !== undefined && { order: data.order }),
      },
      content: data.content !== undefined ? data.content : existingTask.content,
    }

    // Handle file rename if title changed
    let filePath = existingTask.filePath
    if (data.title && data.title !== existingTask.metadata.title) {
      const newFilename = generateFilename(data.id, data.title)
      const newFilePath = path.join(tasksDir, newFilename)

      // Delete old file if path changed
      if (newFilePath !== existingTask.filePath) {
        await fs.promises.unlink(existingTask.filePath)
        filePath = newFilePath
      }
    }

    updatedTask.filePath = filePath

    // Serialize and write to file
    const markdown = serializeTask(updatedTask)
    await fs.promises.writeFile(filePath, markdown, 'utf-8')

    return updatedTask
  })

/**
 * Delete a task
 *
 * Removes the markdown file from the tasks directory.
 */
export const deleteTask = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ taskId: z.string() }).parse(data))
  .handler(async ({ data }): Promise<{ success: boolean; taskId: string }> => {
    const config = resolveConfigSync()
    const tasksDir = getTasksDir(config)

    // Find task file
    const filePath = await findTaskFilePath(tasksDir, data.taskId)
    if (!filePath) {
      throw new Error(`Task not found: ${data.taskId}`)
    }

    // Delete the file
    await fs.promises.unlink(filePath)

    return { success: true, taskId: data.taskId }
  })

/**
 * Move a task between columns (change status) and/or reorder
 *
 * Updates the task's status and order fields in the markdown file.
 * Used for drag-and-drop operations.
 */
export const moveTask = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => MoveTaskInputSchema.parse(data))
  .handler(async ({ data }): Promise<Task> => {
    const config = resolveConfigSync()
    const tasksDir = getTasksDir(config)

    // Load existing task
    const existingTask = await loadTaskById(tasksDir, data.taskId)
    if (!existingTask) {
      throw new Error(`Task not found: ${data.taskId}`)
    }

    // Update status and order
    const updatedTask: Task = {
      ...existingTask,
      metadata: {
        ...existingTask.metadata,
        status: data.newStatus,
        order: data.newOrder,
      },
    }

    // Serialize and write to file
    const markdown = serializeTask(updatedTask)
    await fs.promises.writeFile(existingTask.filePath, markdown, 'utf-8')

    return updatedTask
  })
