import { createFileRoute } from '@tanstack/react-router'
import { createFileWatcher, type FileChange, type FileWatcher } from '../../lib/file-watcher'
import { resolveConfigSync, getTasksDir } from '../../lib/config'

// Singleton watcher instance - shared across all SSE connections
let watcher: FileWatcher | null = null
const clients = new Set<(change: FileChange) => void>()

/**
 * Initialize the file watcher if not already running
 */
async function ensureWatcher(): Promise<void> {
  if (!watcher) {
    const config = resolveConfigSync()
    const tasksDir = getTasksDir(config)

    console.log('[Lunamark] Starting file watcher for:', tasksDir)
    watcher = createFileWatcher(tasksDir)
    await watcher.start()

    // Forward file changes to all connected SSE clients
    watcher.onChange((change) => {
      console.log('[Lunamark] File event:', change.type, change.path)
      clients.forEach((client) => client(change))
    })
  }
}

/**
 * SSE endpoint for file change notifications
 *
 * Clients connect to /api/watch and receive Server-Sent Events
 * whenever a markdown file is added, changed, or deleted.
 *
 * Event format: data: {"type":"change","path":"/path/to/task.md","timestamp":1234567890}
 */
export const Route = createFileRoute('/api/watch')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await ensureWatcher()

        const encoder = new TextEncoder()

        const stream = new ReadableStream({
          start(controller) {
            // Send file change events to this client
            const send = (change: FileChange) => {
              try {
                const data = `data: ${JSON.stringify(change)}\n\n`
                controller.enqueue(encoder.encode(data))
              } catch {
                // Client disconnected, will be cleaned up
              }
            }

            // Send initial connected event
            controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

            // Send heartbeat every 30s to keep connection alive
            const heartbeat = setInterval(() => {
              try {
                controller.enqueue(encoder.encode(': heartbeat\n\n'))
              } catch {
                clearInterval(heartbeat)
              }
            }, 30000)

            // Register this client
            clients.add(send)

            // Clean up on client disconnect
            request.signal.addEventListener('abort', () => {
              clients.delete(send)
              clearInterval(heartbeat)
              try {
                controller.close()
              } catch {
                // Already closed
              }
            })
          },
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      },
    },
  },
})
