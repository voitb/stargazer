import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BOARD_QUERY_KEY } from './useBoard'

interface UseFileWatcherOptions {
  /** Enable/disable the watcher (default: true) */
  enabled?: boolean
  /** Debounce delay in ms before invalidating (default: 200) */
  debounceMs?: number
}

/**
 * Hook to subscribe to file change events via SSE
 *
 * Connects to the /api/watch SSE endpoint and invalidates the board
 * query when files are added, changed, or deleted. This enables
 * real-time sync when files are edited externally (e.g., in VS Code).
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function App() {
 *   // Enable real-time file watching
 *   useFileWatcher({ enabled: true, debounceMs: 200 })
 *
 *   return <KanbanBoard />
 * }
 * ```
 */
export function useFileWatcher(options: UseFileWatcherOptions = {}) {
  const { enabled = true, debounceMs = 200 } = options
  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const invalidateBoard = useCallback(() => {
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce to batch rapid file changes (e.g., save + format)
    debounceTimerRef.current = setTimeout(() => {
      console.log('[Lunamark] File change detected, refetching board...')
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
    }, debounceMs)
  }, [queryClient, debounceMs])

  useEffect(() => {
    // Only run on the client
    if (typeof window === 'undefined' || !enabled) return

    console.log('[Lunamark] Connecting to file watcher SSE...')
    const eventSource = new EventSource('/api/watch')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('[Lunamark] SSE connection established')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'connected') {
          console.log('[Lunamark] File watcher connected')
          return
        }

        // File change event - invalidate board
        if (data.type === 'add' || data.type === 'change' || data.type === 'unlink') {
          console.log('[Lunamark] File event:', data.type, data.path)
          invalidateBoard()
        }
      } catch {
        // Heartbeat or malformed data, ignore
      }
    }

    eventSource.onerror = (error) => {
      console.warn('[Lunamark] SSE connection error, will reconnect...', error)
      // EventSource automatically reconnects on error
    }

    return () => {
      console.log('[Lunamark] Disconnecting from file watcher SSE')
      eventSource.close()
      eventSourceRef.current = null

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [enabled, invalidateBoard])
}
