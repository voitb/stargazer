# Lunamark Implementation Plan

Complete implementation guide with working code for all phases.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Phase 0: Monorepo Setup](#phase-0-monorepo-setup) ✅
4. [Phase 1: Foundation (MVP)](#phase-1-foundation-mvp) ✅
5. [Phase 2: Write Operations](#phase-2-write-operations) ⏳
6. [Phase 3: Real-time Sync](#phase-3-real-time-sync) ⏳
7. [Phase 4: CLI & Polish](#phase-4-cli--polish) ⏳
8. [Testing Checklist](#testing-checklist)

---

## Overview

**Lunamark** is a markdown-based Kanban task management tool. Each task is a `.md` file with YAML frontmatter, enabling version control and editor-based workflows.

### Key Features
- **Markdown-First**: Tasks are `.md` files with YAML frontmatter
- **Bi-directional Sync**: UI changes update files, file changes refresh UI
- **Local-First**: Runs on your machine via `lunamark serve`
- **Developer-Friendly**: Works with git, VS Code, any text editor

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | TanStack Start | Full-stack React with server functions |
| Routing | TanStack Router | Type-safe file-based routing |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Drag & Drop | @dnd-kit | Accessible drag-and-drop |
| Parsing | gray-matter | YAML frontmatter parsing |
| Validation | Zod | Schema validation |
| File Watch | chokidar | Real-time file monitoring |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React UI (Browser)                       │
│  KanbanBoard → Column → TaskCard (drag-drop with dnd-kit)   │
└─────────────────────────┬───────────────────────────────────┘
                          │ TanStack Start Server Functions
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                TanStack Start Server (Node.js)               │
│  getBoard() → loadBoard() → parseTask() for each .md file  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    File System                               │
│  tasks/*.md (YAML frontmatter + markdown body)              │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
apps/lunamark/
├── docs/                    # Documentation
├── tasks/                   # Task markdown files
├── src/
│   ├── lib/                 # Shared utilities
│   │   ├── schemas/task.ts  # Zod schemas
│   │   ├── task-parser.ts   # gray-matter parsing
│   │   └── board-loader.ts  # Directory reading
│   ├── server/              # Server functions
│   │   └── board.ts         # getBoard()
│   ├── hooks/               # React hooks
│   │   └── useBoard.ts      # Data fetching
│   ├── components/          # UI components
│   │   ├── KanbanBoard.tsx
│   │   ├── Column.tsx
│   │   └── TaskCard.tsx
│   └── routes/              # Pages
│       └── index.tsx        # Main board
└── cli/                     # CLI entry (Phase 4)
```

---

## Phase 0: Monorepo Setup

**Status**: ✅ Complete

### Files Created

| File | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | Defines `apps/*` and `packages/*` workspaces |
| `turbo.json` | Build pipeline with caching |
| `tsconfig.base.json` | Shared TypeScript config |
| Root `package.json` | Monorepo scripts |
| `packages/core/` | @stargazer/core placeholder |
| `packages/cli/` | @stargazer/cli placeholder |
| `packages/action/` | @stargazer/action placeholder |

### Commands

```bash
# Run Lunamark from monorepo root
pnpm lunamark

# Build all packages
pnpm build

# Run all dev servers
pnpm dev
```

---

## Phase 1: Foundation (MVP)

**Status**: ✅ Complete

### 1.1 Zod Schemas

**File**: `src/lib/schemas/task.ts`

```typescript
import { z } from 'zod'

/**
 * Helper to coerce Date objects to ISO date strings (YYYY-MM-DD)
 * gray-matter parses YAML dates like `2025-01-15` as Date objects
 */
const dateToString = z.preprocess((val) => {
  if (val instanceof Date) {
    return val.toISOString().split('T')[0]
  }
  return val
}, z.string())

/**
 * Task status values representing Kanban columns
 */
export const TaskStatusSchema = z.enum(['todo', 'in-progress', 'review', 'done'])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

/**
 * Task priority levels
 */
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])
export type TaskPriority = z.infer<typeof TaskPrioritySchema>

/**
 * Task metadata from YAML frontmatter
 */
export const TaskMetadataSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  title: z.string().min(1, 'Task title is required'),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema.optional().default('medium'),
  labels: z
    .array(z.string())
    .optional()
    .nullable()
    .transform((val) => val ?? []),
  assignee: z.string().optional().nullable(),
  created: dateToString.optional().default(() => new Date().toISOString().split('T')[0]),
  due: dateToString.optional().nullable(),
  order: z.number().int().nonnegative().optional().default(0),
})
export type TaskMetadata = z.infer<typeof TaskMetadataSchema>

/**
 * Full task with metadata and markdown content
 */
export const TaskSchema = z.object({
  id: z.string(),
  filePath: z.string(),
  metadata: TaskMetadataSchema,
  content: z.string(),
})
export type Task = z.infer<typeof TaskSchema>

/**
 * Column configuration for the Kanban board
 */
export const ColumnConfigSchema = z.object({
  id: TaskStatusSchema,
  title: z.string(),
  color: z.string().optional(),
  limit: z.number().int().positive().optional(),
})
export type ColumnConfig = z.infer<typeof ColumnConfigSchema>

/**
 * Default column configuration
 */
export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'todo', title: 'To Do', color: 'gray' },
  { id: 'in-progress', title: 'In Progress', color: 'blue' },
  { id: 'review', title: 'Review', color: 'yellow' },
  { id: 'done', title: 'Done', color: 'green' },
]

/**
 * Column with tasks for the board
 */
export const ColumnSchema = z.object({
  id: TaskStatusSchema,
  title: z.string(),
  color: z.string().optional(),
  limit: z.number().optional(),
  tasks: z.array(TaskSchema),
})
export type Column = z.infer<typeof ColumnSchema>

/**
 * Board state with all columns
 */
export const BoardSchema = z.object({
  columns: z.array(ColumnSchema),
  tasksDir: z.string(),
  lastUpdated: z.string(),
})
export type Board = z.infer<typeof BoardSchema>

/**
 * Input for creating a new task
 */
export const CreateTaskInputSchema = z.object({
  title: z.string().min(1),
  status: TaskStatusSchema.default('todo'),
  priority: TaskPrioritySchema.default('medium'),
  labels: z.array(z.string()).default([]),
  assignee: z.string().optional(),
  due: z.string().optional(),
  content: z.string().default(''),
})
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>

/**
 * Input for updating a task
 */
export const UpdateTaskInputSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  labels: z.array(z.string()).optional(),
  assignee: z.string().nullable().optional(),
  due: z.string().nullable().optional(),
  order: z.number().optional(),
  content: z.string().optional(),
})
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>

/**
 * Input for moving a task between columns
 */
export const MoveTaskInputSchema = z.object({
  taskId: z.string(),
  newStatus: TaskStatusSchema,
  newOrder: z.number().int().nonnegative(),
})
export type MoveTaskInput = z.infer<typeof MoveTaskInputSchema>
```

### 1.2 Task Parser

**File**: `src/lib/task-parser.ts`

```typescript
import matter from 'gray-matter'
import { TaskMetadataSchema, type Task, type TaskMetadata } from './schemas/task'

/**
 * Result type for operations that can fail
 */
export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; partial?: Partial<TaskMetadata> }

/**
 * Parse a markdown file content into a Task object
 */
export function parseTask(filePath: string, content: string): ParseResult<Task> {
  try {
    const { data: rawFrontmatter, content: markdownBody } = matter(content)
    const validationResult = TaskMetadataSchema.safeParse(rawFrontmatter)

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')

      return {
        ok: false,
        error: `Invalid frontmatter in ${filePath}: ${errors}`,
        partial: rawFrontmatter as Partial<TaskMetadata>,
      }
    }

    const metadata = validationResult.data

    return {
      ok: true,
      data: {
        id: metadata.id,
        filePath,
        metadata,
        content: markdownBody.trim(),
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      ok: false,
      error: `Failed to parse ${filePath}: ${message}`,
    }
  }
}

/**
 * Serialize a Task object back to markdown with YAML frontmatter
 */
export function serializeTask(task: Task): string {
  const frontmatter: Record<string, unknown> = {
    id: task.metadata.id,
    title: task.metadata.title,
    status: task.metadata.status,
    priority: task.metadata.priority,
    labels: task.metadata.labels,
    created: task.metadata.created,
    order: task.metadata.order,
  }

  if (task.metadata.assignee) {
    frontmatter.assignee = task.metadata.assignee
  }
  if (task.metadata.due) {
    frontmatter.due = task.metadata.due
  }

  return matter.stringify(task.content, frontmatter)
}

/**
 * Generate a slug from a title for file naming
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

/**
 * Generate a filename for a new task
 */
export function generateFilename(id: string, title: string): string {
  const slug = slugify(title)
  return `${id}${slug ? `-${slug}` : ''}.md`
}
```

### 1.3 Board Loader

**File**: `src/lib/board-loader.ts`

```typescript
import * as fs from 'node:fs'
import * as path from 'node:path'
import { parseTask } from './task-parser'
import {
  DEFAULT_COLUMNS,
  type Board,
  type Column,
  type Task,
  type TaskStatus,
} from './schemas/task'

/**
 * Load all tasks from a directory and organize them into a Board
 */
export async function loadBoard(tasksDir: string): Promise<Board> {
  if (!fs.existsSync(tasksDir)) {
    await fs.promises.mkdir(tasksDir, { recursive: true })
  }

  const files = await fs.promises.readdir(tasksDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  const tasks: Task[] = []
  const errors: string[] = []

  for (const file of mdFiles) {
    const filePath = path.join(tasksDir, file)
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const result = parseTask(filePath, content)

    if (result.ok) {
      tasks.push(result.data)
    } else {
      errors.push(result.error)
      console.warn(`[Lunamark] ${result.error}`)
    }
  }

  const tasksByStatus = groupTasksByStatus(tasks)

  const columns: Column[] = DEFAULT_COLUMNS.map((config) => ({
    ...config,
    tasks: sortTasksByOrder(tasksByStatus.get(config.id) || []),
  }))

  return {
    columns,
    tasksDir,
    lastUpdated: new Date().toISOString(),
  }
}

function groupTasksByStatus(tasks: Task[]): Map<TaskStatus, Task[]> {
  const grouped = new Map<TaskStatus, Task[]>()

  for (const task of tasks) {
    const status = task.metadata.status
    const existing = grouped.get(status) || []
    grouped.set(status, [...existing, task])
  }

  return grouped
}

function sortTasksByOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.metadata.order - b.metadata.order)
}

/**
 * Load a single task by ID
 */
export async function loadTaskById(
  tasksDir: string,
  taskId: string
): Promise<Task | null> {
  const files = await fs.promises.readdir(tasksDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  for (const file of mdFiles) {
    const filePath = path.join(tasksDir, file)
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const result = parseTask(filePath, content)

    if (result.ok && result.data.id === taskId) {
      return result.data
    }
  }

  return null
}

/**
 * Get the tasks directory path from environment or default
 */
export function getTasksDir(): string {
  const envDir = process.env.LUNAMARK_TASKS_DIR

  if (envDir) {
    return path.isAbsolute(envDir) ? envDir : path.resolve(process.cwd(), envDir)
  }

  const appRoot = path.resolve(import.meta.dirname, '..', '..')
  return path.resolve(appRoot, 'tasks')
}
```

### 1.4 Server Function

**File**: `src/server/board.ts`

```typescript
import { createServerFn } from '@tanstack/react-start'
import { loadBoard, getTasksDir } from '../lib/board-loader'
import type { Board } from '../lib/schemas/task'

/**
 * Server function to get the Kanban board with all tasks
 */
export const getBoard = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Board> => {
    const tasksDir = getTasksDir()
    return loadBoard(tasksDir)
  }
)
```

### 1.5 useBoard Hook

**File**: `src/hooks/useBoard.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { getBoard } from '../server/board'
import type { Board } from '../lib/schemas/task'

export const BOARD_QUERY_KEY = ['board'] as const

/**
 * Hook to fetch and cache the Kanban board data
 */
export function useBoard() {
  return useQuery<Board, Error>({
    queryKey: BOARD_QUERY_KEY,
    queryFn: () => getBoard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}
```

### 1.6 TaskCard Component

**File**: `src/components/TaskCard.tsx`

```typescript
import { useSortable } from '@dnd-kit/react/sortable'
import type { Task, TaskPriority } from '../lib/schemas/task'

interface TaskCardProps {
  task: Task
  column: string
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
}

export function TaskCard({ task, column }: TaskCardProps) {
  const { ref, isDragging } = useSortable({
    id: task.id,
    index: task.metadata.order,
    group: column,
    type: 'item',
    accept: ['item'],
    data: { task, column },
  })

  return (
    <div
      ref={ref}
      className={`
        bg-white rounded-lg border border-gray-200 p-3 shadow-sm
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        hover:shadow-md hover:border-gray-300
        ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-blue-400' : ''}
      `}
    >
      <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
        {task.metadata.title}
      </h3>

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
```

### 1.7 Column Component

**File**: `src/components/Column.tsx`

```typescript
import { useDroppable } from '@dnd-kit/react'
import type { Column as ColumnType } from '../lib/schemas/task'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  column: ColumnType
}

const columnColors: Record<string, string> = {
  gray: 'bg-gray-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
}

export function Column({ column }: ColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    type: 'column',
    accept: ['item'],
    data: { column },
  })

  return (
    <div
      className={`
        flex flex-col w-72 min-w-72 bg-gray-50 rounded-lg
        ${isDropTarget ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      `}
    >
      <div className="flex items-center gap-2 p-3 border-b border-gray-200">
        <div
          className={`w-2 h-2 rounded-full ${columnColors[column.color || 'gray']}`}
        />
        <h2 className="font-semibold text-gray-700 text-sm">{column.title}</h2>
        <span className="ml-auto bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {column.tasks.length}
        </span>
      </div>

      <div
        ref={ref}
        className={`
          flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]
          ${isDropTarget ? 'bg-blue-50' : ''}
        `}
      >
        {column.tasks.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
            No tasks
          </div>
        ) : (
          column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} column={column.id} />
          ))
        )}
      </div>
    </div>
  )
}
```

### 1.8 KanbanBoard Component

**File**: `src/components/KanbanBoard.tsx`

```typescript
import { useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import type { Board, Task, TaskStatus } from '../lib/schemas/task'
import { Column } from './Column'

interface KanbanBoardProps {
  initialBoard: Board
}

export function KanbanBoard({ initialBoard }: KanbanBoardProps) {
  // Local state for optimistic UI updates
  // In Phase 2, this will sync with server via mutations
  const [items, setItems] = useState<Record<TaskStatus, string[]>>(() => {
    const initial: Record<TaskStatus, string[]> = {
      todo: [],
      'in-progress': [],
      review: [],
      done: [],
    }
    for (const column of initialBoard.columns) {
      initial[column.id] = column.tasks.map((t) => t.id)
    }
    return initial
  })

  const [tasksMap] = useState<Map<string, Task>>(() => {
    const map = new Map<string, Task>()
    for (const column of initialBoard.columns) {
      for (const task of column.tasks) {
        map.set(task.id, task)
      }
    }
    return map
  })

  const handleDragOver = (event: Parameters<typeof move>[1]) => {
    const { source } = event.operation
    if (source?.type === 'column') return
    setItems((current) => move(current, event))
  }

  const columns = initialBoard.columns.map((col) => ({
    ...col,
    tasks: items[col.id]
      .map((id) => tasksMap.get(id))
      .filter((t): t is Task => t !== undefined),
  }))

  return (
    <DragDropProvider onDragOver={handleDragOver}>
      <div className="flex gap-4 p-6 overflow-x-auto min-h-screen bg-gray-100">
        {columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>
    </DragDropProvider>
  )
}
```

### 1.9 Index Route

**File**: `src/routes/index.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { getBoard } from '../server/board'
import { KanbanBoard } from '../components/KanbanBoard'

export const Route = createFileRoute('/')({
  loader: async () => {
    return { board: await getBoard() }
  },
  component: BoardPage,
})

function BoardPage() {
  const { board } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <h1 className="text-xl font-bold text-gray-900">Lunamark</h1>
          </div>
          <div className="text-sm text-gray-500">
            {board.columns.reduce((sum, col) => sum + col.tasks.length, 0)} tasks
          </div>
        </div>
      </header>

      <main>
        <KanbanBoard initialBoard={board} />
      </main>
    </div>
  )
}
```

---

## Phase 2: Write Operations

**Status**: ⏳ Not Started

### 2.1 Task CRUD Server Functions

**File**: `src/server/tasks.ts`

```typescript
import { createServerFn } from '@tanstack/react-start'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { nanoid } from 'nanoid'
import { getTasksDir, loadTaskById } from '../lib/board-loader'
import { serializeTask, generateFilename, parseTask } from '../lib/task-parser'
import {
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  MoveTaskInputSchema,
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
  type MoveTaskInput,
} from '../lib/schemas/task'

/**
 * Create a new task
 */
export const createTask = createServerFn({ method: 'POST' })
  .validator((data: CreateTaskInput) => CreateTaskInputSchema.parse(data))
  .handler(async ({ data }): Promise<Task> => {
    const tasksDir = getTasksDir()
    const id = `task-${Date.now()}-${nanoid(6)}`
    const filename = generateFilename(id, data.title)
    const filePath = path.join(tasksDir, filename)

    const task: Task = {
      id,
      filePath,
      metadata: {
        id,
        title: data.title,
        status: data.status,
        priority: data.priority,
        labels: data.labels,
        assignee: data.assignee ?? null,
        created: new Date().toISOString().split('T')[0],
        due: data.due ?? null,
        order: Date.now(), // Use timestamp for initial ordering
      },
      content: data.content,
    }

    const markdown = serializeTask(task)
    await fs.promises.writeFile(filePath, markdown, 'utf-8')

    return task
  })

/**
 * Update an existing task
 */
export const updateTask = createServerFn({ method: 'POST' })
  .validator((data: UpdateTaskInput) => UpdateTaskInputSchema.parse(data))
  .handler(async ({ data }): Promise<Task> => {
    const tasksDir = getTasksDir()
    const existingTask = await loadTaskById(tasksDir, data.id)

    if (!existingTask) {
      throw new Error(`Task not found: ${data.id}`)
    }

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
      ...(data.content !== undefined && { content: data.content }),
    }

    const markdown = serializeTask(updatedTask)
    await fs.promises.writeFile(existingTask.filePath, markdown, 'utf-8')

    return updatedTask
  })

/**
 * Delete a task
 */
export const deleteTask = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => {
    if (!data.id) throw new Error('Task ID required')
    return data
  })
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const tasksDir = getTasksDir()
    const task = await loadTaskById(tasksDir, data.id)

    if (!task) {
      throw new Error(`Task not found: ${data.id}`)
    }

    await fs.promises.unlink(task.filePath)

    return { success: true }
  })

/**
 * Move a task between columns
 */
export const moveTask = createServerFn({ method: 'POST' })
  .validator((data: MoveTaskInput) => MoveTaskInputSchema.parse(data))
  .handler(async ({ data }): Promise<Task> => {
    const tasksDir = getTasksDir()
    const task = await loadTaskById(tasksDir, data.taskId)

    if (!task) {
      throw new Error(`Task not found: ${data.taskId}`)
    }

    const updatedTask: Task = {
      ...task,
      metadata: {
        ...task.metadata,
        status: data.newStatus,
        order: data.newOrder,
      },
    }

    const markdown = serializeTask(updatedTask)
    await fs.promises.writeFile(task.filePath, markdown, 'utf-8')

    return updatedTask
  })
```

### 2.2 Task Editor Component

**File**: `src/components/TaskEditor.tsx`

```typescript
import { useState } from 'react'
import type { Task, TaskStatus, TaskPriority } from '../lib/schemas/task'

interface TaskEditorProps {
  task?: Task
  isOpen: boolean
  onClose: () => void
  onSave: (data: TaskFormData) => void
  onDelete?: () => void
}

export interface TaskFormData {
  title: string
  status: TaskStatus
  priority: TaskPriority
  labels: string[]
  assignee: string
  due: string
  content: string
}

export function TaskEditor({ task, isOpen, onClose, onSave, onDelete }: TaskEditorProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.metadata.title ?? '',
    status: task?.metadata.status ?? 'todo',
    priority: task?.metadata.priority ?? 'medium',
    labels: task?.metadata.labels ?? [],
    assignee: task?.metadata.assignee ?? '',
    due: task?.metadata.due ?? '',
    content: task?.content ?? '',
  })

  const [labelsInput, setLabelsInput] = useState(formData.labels.join(', '))

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      labels: labelsInput.split(',').map((l) => l.trim()).filter(Boolean),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Assignee & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due}
                  onChange={(e) => setFormData({ ...formData, due: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labels (comma-separated)
              </label>
              <input
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="frontend, bug, urgent"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Markdown)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg h-32 font-mono text-sm"
                placeholder="## Description&#10;&#10;Task details..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            {task && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 2.3 Updated KanbanBoard with Mutations

**File**: `src/components/KanbanBoard.tsx` (Updated)

```typescript
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import type { Board, Task, TaskStatus } from '../lib/schemas/task'
import { Column } from './Column'
import { TaskEditor, type TaskFormData } from './TaskEditor'
import { moveTask, updateTask, deleteTask, createTask } from '../server/tasks'
import { BOARD_QUERY_KEY } from '../hooks/useBoard'

interface KanbanBoardProps {
  initialBoard: Board
}

export function KanbanBoard({ initialBoard }: KanbanBoardProps) {
  const queryClient = useQueryClient()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [items, setItems] = useState<Record<TaskStatus, string[]>>(() => {
    const initial: Record<TaskStatus, string[]> = {
      todo: [],
      'in-progress': [],
      review: [],
      done: [],
    }
    for (const column of initialBoard.columns) {
      initial[column.id] = column.tasks.map((t) => t.id)
    }
    return initial
  })

  const [tasksMap, setTasksMap] = useState<Map<string, Task>>(() => {
    const map = new Map<string, Task>()
    for (const column of initialBoard.columns) {
      for (const task of column.tasks) {
        map.set(task.id, task)
      }
    }
    return map
  })

  // Move task mutation with optimistic update
  const moveMutation = useMutation({
    mutationFn: moveTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
    },
  })

  const handleDragOver = (event: Parameters<typeof move>[1]) => {
    const { source } = event.operation
    if (source?.type === 'column') return
    setItems((current) => move(current, event))
  }

  const handleDragEnd = (event: any) => {
    const { source, target } = event.operation
    if (!source || !target || source.type === 'column') return

    const taskId = source.id as string
    const newStatus = target.data?.column?.id as TaskStatus

    if (newStatus) {
      moveMutation.mutate({
        taskId,
        newStatus,
        newOrder: Date.now(),
      })
    }
  }

  const handleSaveTask = async (data: TaskFormData) => {
    if (selectedTask) {
      await updateTask({
        id: selectedTask.id,
        ...data,
      })
    } else {
      await createTask(data)
    }
    queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
    setSelectedTask(null)
    setIsCreating(false)
  }

  const handleDeleteTask = async () => {
    if (selectedTask) {
      await deleteTask({ id: selectedTask.id })
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
      setSelectedTask(null)
    }
  }

  const columns = initialBoard.columns.map((col) => ({
    ...col,
    tasks: items[col.id]
      .map((id) => tasksMap.get(id))
      .filter((t): t is Task => t !== undefined),
  }))

  return (
    <>
      <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 p-6 overflow-x-auto min-h-screen bg-gray-100">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onTaskClick={(task) => setSelectedTask(task)}
              onAddTask={() => setIsCreating(true)}
            />
          ))}
        </div>
      </DragDropProvider>

      <TaskEditor
        task={selectedTask ?? undefined}
        isOpen={!!selectedTask || isCreating}
        onClose={() => {
          setSelectedTask(null)
          setIsCreating(false)
        }}
        onSave={handleSaveTask}
        onDelete={selectedTask ? handleDeleteTask : undefined}
      />
    </>
  )
}
```

---

## Phase 3: Real-time Sync

**Status**: ⏳ Not Started

### 3.1 File Watcher

**File**: `src/lib/file-watcher.ts`

```typescript
import chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'

export type FileEvent = 'add' | 'change' | 'unlink'

export interface FileChange {
  type: FileEvent
  path: string
  timestamp: number
}

export interface FileWatcher {
  start: () => Promise<void>
  stop: () => Promise<void>
  onChange: (callback: (change: FileChange) => void) => () => void
}

/**
 * Create a file watcher for the tasks directory
 */
export function createFileWatcher(tasksDir: string): FileWatcher {
  let watcher: FSWatcher | null = null
  const callbacks = new Set<(change: FileChange) => void>()

  const notify = (type: FileEvent, path: string) => {
    const change: FileChange = { type, path, timestamp: Date.now() }
    callbacks.forEach((cb) => cb(change))
  }

  return {
    async start() {
      watcher = chokidar.watch(`${tasksDir}/**/*.md`, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      })

      watcher.on('add', (path) => notify('add', path))
      watcher.on('change', (path) => notify('change', path))
      watcher.on('unlink', (path) => notify('unlink', path))

      await new Promise<void>((resolve) => watcher!.on('ready', resolve))
    },

    async stop() {
      await watcher?.close()
      watcher = null
    },

    onChange(callback) {
      callbacks.add(callback)
      return () => callbacks.delete(callback)
    },
  }
}
```

### 3.2 SSE Endpoint

**File**: `src/server/watcher.ts`

```typescript
import { createServerFn } from '@tanstack/react-start'
import { createFileWatcher, type FileChange } from '../lib/file-watcher'
import { getTasksDir } from '../lib/board-loader'

// Global watcher instance (singleton)
let watcher: ReturnType<typeof createFileWatcher> | null = null
const clients = new Set<(change: FileChange) => void>()

async function ensureWatcher() {
  if (!watcher) {
    const tasksDir = getTasksDir()
    watcher = createFileWatcher(tasksDir)
    await watcher.start()

    watcher.onChange((change) => {
      clients.forEach((client) => client(change))
    })
  }
}

/**
 * SSE endpoint for file change notifications
 * Returns an async iterator of file changes
 */
export const watchFiles = createServerFn({ method: 'GET' }).handler(
  async function* (): AsyncGenerator<FileChange> {
    await ensureWatcher()

    const queue: FileChange[] = []
    let resolve: (() => void) | null = null

    const callback = (change: FileChange) => {
      queue.push(change)
      resolve?.()
    }

    clients.add(callback)

    try {
      while (true) {
        if (queue.length === 0) {
          await new Promise<void>((r) => {
            resolve = r
          })
        }

        while (queue.length > 0) {
          yield queue.shift()!
        }
      }
    } finally {
      clients.delete(callback)
    }
  }
)
```

### 3.3 useFileWatcher Hook

**File**: `src/hooks/useFileWatcher.ts`

```typescript
import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BOARD_QUERY_KEY } from './useBoard'

/**
 * Hook to subscribe to file changes and refetch the board
 */
export function useFileWatcher() {
  const queryClient = useQueryClient()

  const refetchBoard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
  }, [queryClient])

  useEffect(() => {
    // Create EventSource for SSE
    const eventSource = new EventSource('/api/watch')

    eventSource.onmessage = (event) => {
      const change = JSON.parse(event.data)
      console.log('[Lunamark] File changed:', change)
      refetchBoard()
    }

    eventSource.onerror = () => {
      console.warn('[Lunamark] SSE connection error, reconnecting...')
    }

    return () => {
      eventSource.close()
    }
  }, [refetchBoard])
}
```

---

## Phase 4: CLI & Polish

**Status**: ⏳ Not Started

### 4.1 CLI Entry Point

**File**: `cli/index.ts`

```typescript
#!/usr/bin/env node
import { Command } from 'commander'
import { spawn } from 'node:child_process'
import * as path from 'node:path'
import * as fs from 'node:fs'

const program = new Command()
  .name('lunamark')
  .description('Markdown-based Kanban task management')
  .version('0.1.0')

program
  .command('serve')
  .description('Start the Kanban board server')
  .option('-p, --port <number>', 'Port number', '3000')
  .option('-d, --dir <path>', 'Tasks directory', './tasks')
  .option('--open', 'Open browser automatically', false)
  .action(async (options) => {
    const tasksDir = path.resolve(process.cwd(), options.dir)

    // Ensure tasks directory exists
    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true })
      console.log(`Created tasks directory: ${tasksDir}`)
    }

    // Set environment variables
    process.env.LUNAMARK_TASKS_DIR = tasksDir
    process.env.PORT = options.port

    console.log(`\n  🌙 Lunamark`)
    console.log(`  Tasks: ${tasksDir}`)
    console.log(`  URL: http://localhost:${options.port}\n`)

    // Start the dev server
    const appDir = path.resolve(__dirname, '..')
    const child = spawn('pnpm', ['dev'], {
      cwd: appDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: options.port,
      },
    })

    if (options.open) {
      setTimeout(() => {
        import('open').then((mod) => {
          mod.default(`http://localhost:${options.port}`)
        })
      }, 2000)
    }

    child.on('close', (code) => {
      process.exit(code ?? 0)
    })
  })

program
  .command('init')
  .description('Initialize a tasks directory with sample tasks')
  .option('-d, --dir <path>', 'Tasks directory', './tasks')
  .action(async (options) => {
    const tasksDir = path.resolve(process.cwd(), options.dir)

    if (fs.existsSync(tasksDir)) {
      console.log(`Tasks directory already exists: ${tasksDir}`)
      return
    }

    fs.mkdirSync(tasksDir, { recursive: true })

    // Create sample tasks
    const sampleTasks = [
      {
        id: 'task-001',
        title: 'Welcome to Lunamark',
        status: 'done',
        content: '## Getting Started\n\nThis is your first task!',
      },
      {
        id: 'task-002',
        title: 'Create your first task',
        status: 'todo',
        content: '## Instructions\n\n1. Click "+ Add Task"\n2. Fill in the details\n3. Save',
      },
    ]

    for (const task of sampleTasks) {
      const filename = `${task.id}-${task.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}.md`
      const content = `---
id: ${task.id}
title: ${task.title}
status: ${task.status}
priority: medium
labels: []
created: ${new Date().toISOString().split('T')[0]}
order: 0
---

${task.content}
`
      fs.writeFileSync(path.join(tasksDir, filename), content)
    }

    console.log(`✅ Created tasks directory: ${tasksDir}`)
    console.log(`   Created ${sampleTasks.length} sample tasks`)
    console.log(`\nRun 'lunamark serve' to start the board`)
  })

program
  .command('list')
  .description('List tasks in the terminal')
  .option('-d, --dir <path>', 'Tasks directory', './tasks')
  .option('-s, --status <status>', 'Filter by status')
  .action(async (options) => {
    const tasksDir = path.resolve(process.cwd(), options.dir)

    if (!fs.existsSync(tasksDir)) {
      console.error(`Tasks directory not found: ${tasksDir}`)
      process.exit(1)
    }

    // Dynamic import to avoid bundling issues
    const { loadBoard } = await import('../src/lib/board-loader')
    const board = await loadBoard(tasksDir)

    const statusColors: Record<string, string> = {
      todo: '\x1b[90m',
      'in-progress': '\x1b[34m',
      review: '\x1b[33m',
      done: '\x1b[32m',
    }
    const reset = '\x1b[0m'

    for (const column of board.columns) {
      if (options.status && column.id !== options.status) continue

      console.log(`\n${statusColors[column.id]}■${reset} ${column.title} (${column.tasks.length})`)

      for (const task of column.tasks) {
        console.log(`  • ${task.metadata.title}`)
      }
    }
  })

program.parse()
```

### 4.2 package.json bin entry

```json
{
  "bin": {
    "lunamark": "./dist/cli/index.js"
  }
}
```

---

## Testing Checklist

### Phase 1 Verification
- [ ] Run `pnpm lunamark` and verify board loads
- [ ] Verify all 7 sample tasks display correctly
- [ ] Verify tasks grouped by status column
- [ ] Verify drag-and-drop works (local state only)
- [ ] Verify priority colors display correctly
- [ ] Verify labels display correctly

### Phase 2 Verification
- [ ] Create new task via UI → verify .md file created
- [ ] Edit task via UI → verify .md file updated
- [ ] Delete task via UI → verify .md file removed
- [ ] Drag task to new column → verify status updates in file
- [ ] Verify optimistic updates feel instant

### Phase 3 Verification
- [ ] Edit .md file in VS Code → verify UI updates within 1 second
- [ ] Create new .md file → verify task appears in UI
- [ ] Delete .md file → verify task removed from UI
- [ ] Verify SSE connection reconnects after disconnect

### Phase 4 Verification
- [ ] Run `lunamark serve` from any directory
- [ ] Run `lunamark init` to scaffold tasks/
- [ ] Run `lunamark list` to view tasks in terminal
- [ ] Verify `--port` and `--dir` flags work

---

## Resources

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Query Docs](https://tanstack.com/query)
- [dnd-kit Documentation](https://dndkit.com/)
- [gray-matter npm](https://www.npmjs.com/package/gray-matter)
- [Zod Documentation](https://zod.dev/)
- [chokidar npm](https://www.npmjs.com/package/chokidar)
