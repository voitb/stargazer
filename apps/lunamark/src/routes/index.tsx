import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppHeader } from "@/components/header/app-header";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { useBoard } from "@/hooks/kanban/use-board";
import { useTaskEditor } from "@/hooks/task-editor/use-task-editor";
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
	const taskEditor = useTaskEditor();

	const board = queryBoard ?? loaderBoard;

	// Keyboard shortcut: N to add task to Todo column
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			// Ignore if user is typing in an input or textarea
			const target = event.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			if (event.key === "n" || event.key === "N") {
				event.preventDefault();
				taskEditor.openCreate("todo");
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [taskEditor]);

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-[rgb(var(--color-neutral-background-2))]">
			<AppHeader board={board} onAddTask={() => taskEditor.openCreate("todo")} />

			<main className="flex-1 flex flex-col min-h-0">
				<KanbanBoard initialBoard={board} taskEditor={taskEditor} />
			</main>
		</div>
	);
}
