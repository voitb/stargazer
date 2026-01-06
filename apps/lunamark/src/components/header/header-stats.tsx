import { CheckCircle2, CircleDot, ListTodo } from "lucide-react";
import { useMemo } from "react";
import { StatPill } from "@ui/components";
import type { Board } from "@/schemas/task";

interface HeaderStatsProps {
	board: Board;
}

export function HeaderStats({ board }: HeaderStatsProps) {
	const stats = useMemo(() => {
		const allTasks = board.columns.flatMap((col) => col.tasks);
		const inProgress = board.columns.find((c) => c.id === "in-progress")?.tasks.length ?? 0;
		const done = board.columns.find((c) => c.id === "done")?.tasks.length ?? 0;

		return {
			total: allTasks.length,
			inProgress,
			done,
		};
	}, [board]);

	return (
		<div className="hidden md:flex items-center gap-2">
			<StatPill
				icon={ListTodo}
				label="tasks"
				value={stats.total}
			/>
			<StatPill
				icon={CircleDot}
				label="in progress"
				value={stats.inProgress}
				variant="warning"
			/>
			<StatPill
				icon={CheckCircle2}
				label="done"
				value={stats.done}
				variant="success"
			/>
		</div>
	);
}
