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
 *
 * Watches for markdown file changes and notifies subscribers.
 * Uses debouncing to handle rapid saves (e.g., from text editors).
 *
 * @param tasksDir - Absolute path to watch for .md files
 * @returns FileWatcher instance with start/stop/onChange methods
 *
 * @example
 * ```ts
 * const watcher = createFileWatcher('/path/to/tasks')
 * await watcher.start()
 *
 * const unsubscribe = watcher.onChange((change) => {
 *   console.log(`File ${change.type}: ${change.path}`)
 * })
 *
 * // Later...
 * unsubscribe()
 * await watcher.stop()
 * ```
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
      if (watcher) return // Already started

      watcher = chokidar.watch(`${tasksDir}/**/*.md`, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100, // Wait 100ms for write to stabilize
          pollInterval: 50,
        },
        // Ignore hidden files and common temp files
        ignored: /(^|[\/\\])\.|\.swp$|~$/,
      })

      watcher.on('add', (path) => notify('add', path))
      watcher.on('change', (path) => notify('change', path))
      watcher.on('unlink', (path) => notify('unlink', path))

      // Wait for initial scan to complete
      await new Promise<void>((resolve) => watcher!.on('ready', resolve))
    },

    async stop() {
      if (watcher) {
        await watcher.close()
        watcher = null
      }
      callbacks.clear()
    },

    onChange(callback) {
      callbacks.add(callback)
      return () => callbacks.delete(callback)
    },
  }
}
