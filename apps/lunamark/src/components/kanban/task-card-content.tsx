import { PRIORITY_COLORS } from "@/lib/kanban/constants";
import { cn } from "@/lib/utils/cn";
import type { Task } from "@/schemas/task";

interface TaskCardContentProps {
	task: Task;
	isDragOverlay?: boolean;
	onClick?: () => void;
	className?: string;
}

export function TaskCardContent({
	task,
	isDragOverlay,
	onClick,
	className,
}: TaskCardContentProps) {
	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
			className={cn(
				"group relative bg-white rounded-xl p-4 shadow-sm border border-transparent",
				"hover:shadow-md hover:border-gray-200 transition-all duration-200 ease-in-out",
				isDragOverlay
					? "shadow-2xl rotate-2 scale-105 ring-1 ring-black/5 cursor-grabbing"
					: "cursor-grab active:cursor-grabbing",
				className,
			)}
		>
			<div className="flex items-start justify-between mb-3 gap-2">
				<div className="flex flex-wrap gap-1.5">
					<span
						className={cn(
							"px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase",
							PRIORITY_COLORS[task.metadata.priority],
						)}
					>
						{task.metadata.priority}
					</span>
					{task.metadata.labels.slice(0, 2).map((label) => (
						<span
							key={label}
							className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-medium border border-gray-100"
						>
							{label}
						</span>
					))}
					{task.metadata.labels.length > 2 && (
						<span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-full text-[10px] border border-gray-100">
							+{task.metadata.labels.length - 2}
						</span>
					)}
				</div>
			</div>

			<h3 className="font-semibold text-gray-800 text-[15px] leading-snug mb-3">
				{task.metadata.title}
			</h3>

			<div className="flex items-center justify-between pt-3 border-t border-gray-50">
				<div className="flex items-center gap-2">
					{task.metadata.assignee ? (
						<div
							className="flex items-center gap-1.5 group/assignee"
							title={task.metadata.assignee}
						>
							<div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-indigo-100">
								{task.metadata.assignee[0]?.toUpperCase()}
							</div>
						</div>
					) : (
						<div className="w-6 h-6 rounded-full border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
							<span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
								?
							</span>
						</div>
					)}
				</div>

				<div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
					<span className="tracking-tighter opacity-70">
						#{task.metadata.id.slice(-4)}
					</span>
					{task.metadata.due && (
						<span
							className={cn(
								"px-1.5 py-0.5 rounded",
								new Date(task.metadata.due) < new Date() &&
									"text-red-500 bg-red-50",
							)}
						>
							{new Date(task.metadata.due).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
							})}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
