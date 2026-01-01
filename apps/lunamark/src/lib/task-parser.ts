import matter from 'gray-matter'
import { TaskMetadataSchema, type Task, type TaskMetadata } from '@/schemas/task'

/**
 * Result type for operations that can fail
 */
export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; partial?: Partial<TaskMetadata> }

/**
 * Parse a markdown file content into a Task object
 *
 * @param filePath - Absolute path to the markdown file
 * @param content - Raw file content with YAML frontmatter
 * @returns ParseResult with Task or error message
 *
 * @example
 * ```ts
 * const result = parseTask('/path/to/task.md', fileContent)
 * if (result.ok) {
 *   console.log(result.data.metadata.title)
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export function parseTask(filePath: string, content: string): ParseResult<Task> {
  try {
    // Parse frontmatter and markdown body using gray-matter
    const { data: rawFrontmatter, content: markdownBody } = matter(content)

    // Validate frontmatter with Zod
    const validationResult = TaskMetadataSchema.safeParse(rawFrontmatter)

    if (!validationResult.success) {
      // Return partial data for display with warning
      // Note: Zod v4 uses .issues instead of .errors
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
 *
 * @param task - Task object to serialize
 * @returns Markdown string with YAML frontmatter
 *
 * @example
 * ```ts
 * const markdown = serializeTask(task)
 * await fs.promises.writeFile(task.filePath, markdown)
 * ```
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

  // Only include optional fields if they have values
  if (task.metadata.assignee) {
    frontmatter.assignee = task.metadata.assignee
  }
  if (task.metadata.due) {
    frontmatter.due = task.metadata.due
  }

  // Use gray-matter's stringify to maintain proper formatting
  return matter.stringify(task.content, frontmatter)
}

/**
 * Generate a slug from a title for file naming
 *
 * @param title - Task title
 * @returns URL-safe slug
 *
 * @example
 * ```ts
 * slugify('Fix Login Bug') // 'fix-login-bug'
 * ```
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
 *
 * @param id - Task ID
 * @param title - Task title
 * @returns Filename like 'task-001-fix-login-bug.md'
 */
export function generateFilename(id: string, title: string): string {
  const slug = slugify(title)
  return `${id}${slug ? `-${slug}` : ''}.md`
}
