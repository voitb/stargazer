import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { useBoard } from "@/hooks/kanban/use-board";
import { getBoard } from "@/server/board";
import type { TaskPriority } from "@/schemas/task";

const VALID_PRIORITIES = ["low", "medium", "high", "critical"] as const;

function isValidPriority(value: unknown): value is TaskPriority {
	return (
		typeof value === "string" &&
		VALID_PRIORITIES.includes(value as TaskPriority)
	);
}

export const Route = createFileRoute("/")({
	validateSearch: (
		search: Record<string, unknown>,
	): {
		assignee?: string;
		priority?: TaskPriority;
		labels?: string[];
	} => ({
		assignee:
			typeof search.assignee === "string" ? search.assignee : undefined,
		priority: isValidPriority(search.priority) ? search.priority : undefined,
		labels: Array.isArray(search.labels)
			? search.labels.filter((l): l is string => typeof l === "string")
			: undefined,
	}),
	loader: async () => {
		return { board: await getBoard() };
	},
	component: BoardPage,
});

function BoardPage() {
	const { board: loaderBoard } = Route.useLoaderData();
	const { data: queryBoard } = useBoard();

	const board = queryBoard ?? loaderBoard;

	return (
		<div className="min-h-screen bg-gray-100">
			<header className="bg-white border-b border-gray-200 px-6 py-4">
				<div className="flex items-center justify-between max-w-7xl mx-auto">
					<div className="flex items-center gap-3">
						<span className="text-2xl">🌙</span>
						<h1 className="text-xl font-bold text-gray-900">Lunamark</h1>
					</div>
					<div className="text-sm text-gray-500">
						{board.columns.reduce((sum, col) => sum + col.tasks.length, 0)}{" "}
						tasks
					</div>
				</div>
			</header>

			<main>
				<KanbanBoard initialBoard={board} />
			</main>
		</div>
	);
}
