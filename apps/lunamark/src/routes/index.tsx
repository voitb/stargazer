import { createFileRoute } from '@tanstack/react-router'
import { getBoard } from '@/server/board'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { useBoard } from '@/hooks/useBoard'

export const Route = createFileRoute('/')({
  // Load board data on the server before rendering (SSR)
  loader: async () => {
    return { board: await getBoard() }
  },
  component: BoardPage,
})

function BoardPage() {
  // Use loader data as initial/fallback, but subscribe to React Query for updates
  const { board: loaderBoard } = Route.useLoaderData()
  const { data: queryBoard } = useBoard()

  // Prefer React Query data (for updates after mutations), fall back to loader data
  const board = queryBoard ?? loaderBoard

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

      {/* Board */}
      <main>
        <KanbanBoard initialBoard={board} />
      </main>
    </div>
  )
}
