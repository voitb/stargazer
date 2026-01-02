import { X } from "lucide-react";
import { useId } from "react";
import { useTaskEditorForm } from "@/hooks/task-editor/use-task-editor-form";
import { cn } from "@/lib/utils/cn";
import type { Task, TaskStatus } from "@/schemas/task";

interface TaskEditorProps {
	task?: Task;
	initialStatus?: TaskStatus;
	isOpen: boolean;
	onClose: () => void;
}

export function TaskEditor({
	task,
	initialStatus = "todo",
	isOpen,
	onClose,
}: TaskEditorProps) {
	const id = useId();

	const form = useTaskEditorForm({ task, initialStatus, isOpen, onClose });

	if (!isOpen) return null;

	const titleId = `${id}-title`;
	const statusId = `${id}-status`;
	const priorityId = `${id}-priority`;
	const labelsId = `${id}-labels`;
	const assigneeId = `${id}-assignee`;
	const dueId = `${id}-due`;
	const contentId = `${id}-content`;

	return (
		<div className={cn("fixed inset-0 z-50 flex items-center justify-center")}>
			<div
				role="presentation"
				className={cn("absolute inset-0 bg-black/50")}
				onClick={onClose}
			/>

			<div
				className={cn(
					"relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto",
				)}
			>
				<div
					className={cn(
						"flex items-center justify-between p-4 border-b border-gray-200",
					)}
				>
					<h2 className={cn("text-lg font-semibold text-gray-900")}>
						{form.isEditing ? "Edit Task" : "New Task"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className={cn("p-1 text-gray-400 hover:text-gray-600 rounded")}
					>
						<X className={cn("w-5 h-5")} />
					</button>
				</div>

				<div className={cn("p-4 space-y-4")}>
					<div>
						<label
							htmlFor={titleId}
							className={cn("block text-sm font-medium text-gray-700 mb-1")}
						>
							Title <span className={cn("text-red-500")}>*</span>
						</label>
						<input
							id={titleId}
							type="text"
							value={form.state.title}
							onChange={form.setField("title")}
							placeholder="Enter task title"
							className={cn(
								"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
							)}
						/>
					</div>

					<div className={cn("grid grid-cols-2 gap-4")}>
						<div>
							<label
								htmlFor={statusId}
								className={cn("block text-sm font-medium text-gray-700 mb-1")}
							>
								Status
							</label>
							<select
								id={statusId}
								value={form.state.status}
								onChange={form.setStatus}
								className={cn(
									"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
								)}
							>
								<option value="todo">To Do</option>
								<option value="in-progress">In Progress</option>
								<option value="review">Review</option>
								<option value="done">Done</option>
							</select>
						</div>

						<div>
							<label
								htmlFor={priorityId}
								className={cn("block text-sm font-medium text-gray-700 mb-1")}
							>
								Priority
							</label>
							<select
								id={priorityId}
								value={form.state.priority}
								onChange={form.setPriority}
								className={cn(
									"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
								)}
							>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
								<option value="critical">Critical</option>
							</select>
						</div>
					</div>

					<div>
						<label
							htmlFor={labelsId}
							className={cn("block text-sm font-medium text-gray-700 mb-1")}
						>
							Labels
						</label>
						<input
							id={labelsId}
							type="text"
							value={form.state.labels}
							onChange={form.setField("labels")}
							placeholder="bug, feature, urgent (comma separated)"
							className={cn(
								"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
							)}
						/>
					</div>

					<div className={cn("grid grid-cols-2 gap-4")}>
						<div>
							<label
								htmlFor={assigneeId}
								className={cn("block text-sm font-medium text-gray-700 mb-1")}
							>
								Assignee
							</label>
							<input
								id={assigneeId}
								type="text"
								value={form.state.assignee}
								onChange={form.setField("assignee")}
								placeholder="Name"
								className={cn(
									"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
								)}
							/>
						</div>

						<div>
							<label
								htmlFor={dueId}
								className={cn("block text-sm font-medium text-gray-700 mb-1")}
							>
								Due Date
							</label>
							<input
								id={dueId}
								type="date"
								value={form.state.due}
								onChange={form.setField("due")}
								className={cn(
									"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500",
								)}
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor={contentId}
							className={cn("block text-sm font-medium text-gray-700 mb-1")}
						>
							Description (Markdown)
						</label>
						<textarea
							id={contentId}
							value={form.state.content}
							onChange={form.setField("content")}
							placeholder="## Description&#10;&#10;Add task details..."
							rows={6}
							className={cn(
								"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm",
							)}
						/>
					</div>
				</div>

				<div
					className={cn(
						"flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50",
					)}
				>
					{form.isEditing ? (
						form.state.showDeleteConfirm ? (
							<div className={cn("flex items-center gap-2")}>
								<span className={cn("text-sm text-red-600")}>
									Delete this task?
								</span>
								<button
									type="button"
									onClick={form.handleDelete}
									disabled={form.isPending}
									className={cn(
										"px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50",
									)}
								>
									{form.isDeleting ? "Deleting..." : "Yes, Delete"}
								</button>
								<button
									type="button"
									onClick={() => form.toggleDeleteConfirm(false)}
									disabled={form.isPending}
									className={cn(
										"px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50",
									)}
								>
									Cancel
								</button>
							</div>
						) : (
							<button
								type="button"
								onClick={() => form.toggleDeleteConfirm(true)}
								disabled={form.isPending}
								className={cn(
									"text-sm text-red-600 hover:text-red-700 disabled:opacity-50",
								)}
							>
								Delete task
							</button>
						)
					) : (
						<div />
					)}

					<div className={cn("flex items-center gap-2")}>
						<button
							type="button"
							onClick={onClose}
							disabled={form.isPending}
							className={cn(
								"px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50",
							)}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={form.handleSave}
							disabled={!form.canSave}
							className={cn(
								"px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
							)}
						>
							{form.isPending
								? form.isEditing
									? "Saving..."
									: "Creating..."
								: form.isEditing
									? "Save Changes"
									: "Create Task"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
