import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/header/app-header";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { useBoard } from "@/hooks/kanban/use-board";
import { useBoardKeyboardShortcuts } from "@/hooks/keyboard";
import { validateRouteSearch } from "@/hooks/routing";
import { useTaskEditor } from "@/hooks/task-editor/use-task-editor";
import { getBoard } from "@/server/board";

export const Route = createFileRoute("/")({
	validateSearch: validateRouteSearch,
	loader: async () => {
		return { board: await getBoard() };
	},
	component: BoardPage,
});

function BoardPage() {
	const { board: loaderBoard } = Route.useLoaderData();
	const { data: queryBoard } = useBoard();
	const taskEditor = useTaskEditor();

	const board = queryBoard ?? loaderBoard;

	useBoardKeyboardShortcuts({
		onCreateTask: (status) => taskEditor.openCreate(status),
	});

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-[rgb(var(--color-neutral-background-2))]">
			<AppHeader board={board} onAddTask={() => taskEditor.openCreate("todo")} />

			<main className="flex-1 flex flex-col min-h-0">
				<KanbanBoard initialBoard={board} taskEditor={taskEditor} />
			</main>
		</div>
	);
}
