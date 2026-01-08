import { Command } from 'commander'
import * as path from 'node:path'
import * as fs from 'node:fs'

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  gray: '\x1b[90m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

// Color mapping for status columns
const statusColors: Record<string, string> = {
  todo: colors.gray,
  'in-progress': colors.blue,
  review: colors.yellow,
  done: colors.green,
}

// Color mapping for priority badges
const priorityBadge: Record<string, string> = {
  low: `${colors.dim}[L]${colors.reset}`,
  medium: `${colors.blue}[M]${colors.reset}`,
  high: `${colors.yellow}[H]${colors.reset}`,
  critical: `${colors.red}[!]${colors.reset}`,
}

// Column display names
const columnNames: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
}

interface TaskMetadata {
  id: string
  title: string
  status: string
  priority: string
  labels: string[]
  assignee: string | null
  due: string | null
  order: number
}

/**
 * Parse YAML frontmatter from markdown content
 * Simple parser that handles the basic task format
 */
function parseTaskFile(content: string): TaskMetadata | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return null

  const frontmatter = frontmatterMatch[1]
  const metadata: Partial<TaskMetadata> = {}

  // Parse YAML fields (simple parser)
  const lines = frontmatter.split('\n')
  let currentKey: string | null = null
  let arrayValue: string[] = []

  for (const line of lines) {
    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim()
      arrayValue.push(value)
      continue
    }

    // Save previous array if we have one
    if (currentKey && arrayValue.length > 0) {
      ;(metadata as Record<string, unknown>)[currentKey] = arrayValue
      arrayValue = []
    }

    // Key: value pair
    const match = line.match(/^(\w+):\s*(.*)$/)
    if (match) {
      currentKey = match[1]
      const value = match[2].trim()

      if (value === '' || value === 'null') {
        // Could be array or null
        ;(metadata as Record<string, unknown>)[currentKey] = null
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        const items = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim())
        ;(metadata as Record<string, unknown>)[currentKey] = items
      } else {
        // Scalar value
        ;(metadata as Record<string, unknown>)[currentKey] =
          value === 'null' ? null : value
      }
    }
  }

  // Save final array if pending
  if (currentKey && arrayValue.length > 0) {
    ;(metadata as Record<string, unknown>)[currentKey] = arrayValue
  }

  // Parse order as number
  if (metadata.order) {
    metadata.order = parseInt(metadata.order as unknown as string, 10) || 0
  }

  return metadata as TaskMetadata
}

/**
 * List tasks in the terminal with colored output
 *
 * Reads all markdown files from the tasks directory and displays
 * them organized by column with priority badges and metadata.
 */
export const listCommand = new Command('list')
  .description('List tasks in the terminal')
  .option('-d, --dir <path>', 'Tasks directory', './tasks')
  .option('-s, --status <status>', 'Filter by status (todo, in-progress, review, done)')
  .option('-p, --priority <priority>', 'Filter by priority (low, medium, high, critical)')
  .option('--json', 'Output as JSON', false)
  .action(async (options) => {
    const tasksDir = path.resolve(process.cwd(), options.dir)

    // Check if directory exists
    if (!fs.existsSync(tasksDir)) {
      console.error(`
  ${colors.red}Error:${colors.reset} Tasks directory not found: ${tasksDir}

  Run 'lunamark init' to create one, or specify a different directory with --dir
      `)
      process.exit(1)
    }

    // Read all markdown files
    const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith('.md'))

    if (files.length === 0) {
      console.log(`
  ${colors.yellow}No tasks found${colors.reset} in ${tasksDir}

  Run 'lunamark init --dir ${options.dir}' to create sample tasks
      `)
      return
    }

    // Parse all tasks
    const tasks: TaskMetadata[] = []
    for (const file of files) {
      const content = fs.readFileSync(path.join(tasksDir, file), 'utf-8')
      const metadata = parseTaskFile(content)
      if (metadata) {
        tasks.push(metadata)
      }
    }

    // JSON output
    if (options.json) {
      const filtered = tasks.filter((t) => {
        if (options.status && t.status !== options.status) return false
        if (options.priority && t.priority !== options.priority) return false
        return true
      })
      console.log(JSON.stringify(filtered, null, 2))
      return
    }

    // Group by status
    const byStatus = new Map<string, TaskMetadata[]>()
    const statuses = ['todo', 'in-progress', 'review', 'done']

    for (const status of statuses) {
      byStatus.set(status, [])
    }

    for (const task of tasks) {
      const list = byStatus.get(task.status) || []
      list.push(task)
      byStatus.set(task.status, list)
    }

    // Sort tasks by order within each column
    for (const [, taskList] of byStatus) {
      taskList.sort((a, b) => (a.order || 0) - (b.order || 0))
    }

    // Display
    console.log()

    for (const status of statuses) {
      // Apply status filter
      if (options.status && status !== options.status) continue

      const taskList = byStatus.get(status) || []
      const color = statusColors[status] || colors.gray
      const name = columnNames[status] || status

      console.log(
        `${color}■${colors.reset} ${colors.bold}${name}${colors.reset} (${taskList.length})`
      )

      for (const task of taskList) {
        // Apply priority filter
        if (options.priority && task.priority !== options.priority) continue

        const badge = priorityBadge[task.priority] || priorityBadge.medium
        const assignee = task.assignee
          ? ` ${colors.cyan}@${task.assignee}${colors.reset}`
          : ''
        const due = task.due
          ? ` ${colors.magenta}📅 ${task.due}${colors.reset}`
          : ''
        const labels =
          task.labels && task.labels.length > 0
            ? ` ${colors.dim}[${task.labels.join(', ')}]${colors.reset}`
            : ''

        console.log(`  ${badge} ${task.title}${labels}${assignee}${due}`)
      }

      console.log()
    }

    // Summary
    const totalTasks = tasks.length
    const doneTasks = (byStatus.get('done') || []).length
    console.log(
      `${colors.dim}Total: ${totalTasks} tasks | Done: ${doneTasks}${colors.reset}`
    )
    console.log()
  })
