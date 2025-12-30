import { useQuery } from '@tanstack/react-query'
import { getBoard } from '../serverFunctions/board'
import type { Board } from '../lib/schemas/task'

/**
 * Query key for the board data
 */
export const BOARD_QUERY_KEY = ['board'] as const

/**
 * Hook to fetch and cache the Kanban board data
 *
 * Uses TanStack Query for:
 * - Automatic caching (5 minute stale time)
 * - Background refetching
 * - Loading/error states
 *
 * @example
 * ```tsx
 * function BoardPage() {
 *   const { data: board, isLoading, error } = useBoard()
 *
 *   if (isLoading) return <Loading />
 *   if (error) return <Error error={error} />
 *
 *   return <KanbanBoard board={board} />
 * }
 * ```
 */
export function useBoard() {
  return useQuery<Board, Error>({
    queryKey: BOARD_QUERY_KEY,
    queryFn: () => getBoard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}
