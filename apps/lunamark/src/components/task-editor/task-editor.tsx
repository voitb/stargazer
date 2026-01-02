import { X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { useCreateTask, useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/schemas/task";

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
	const isEditing = Boolean(task);
	const id = useId();

	const [title, setTitle] = useState("");
	const [status, setStatus] = useState<TaskStatus>(initialStatus);
	const [priority, setPriority] = useState<TaskPriority>("medium");
	const [labels, setLabels] = useState("");
	const [assignee, setAssignee] = useState("");
	const [due, setDue] = useState("");
	const [content, setContent] = useState("");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const { mutate: createTask, isPending: isCreating } = useCreateTask();
	const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
	const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

	const isPending = isCreating || isUpdating || isDeleting;

	useEffect(() => {
		if (task) {
			setTitle(task.metadata.title);
			setStatus(task.metadata.status);
			setPriority(task.metadata.priority);
			setLabels(task.metadata.labels.join(", "));
			setAssignee(task.metadata.assignee || "");
			setDue(task.metadata.due || "");
			setContent(task.content);
		} else {
			setTitle("");
			setStatus(initialStatus);
			setPriority("medium");
			setLabels("");
			setAssignee("");
			setDue("");
			setContent("");
		}
		setShowDeleteConfirm(false);
	}, [task, initialStatus, isOpen]);

	const handleSave = useCallback(() => {
		if (!title.trim()) return;

		const labelsArray = labels
			.split(",")
			.map((l) => l.trim())
			.filter(Boolean);

		if (isEditing && task) {
			updateTask(
				{
					id: task.id,
					title: title.trim(),
					status,
					priority,
					labels: labelsArray,
					assignee: assignee.trim() || null,
					due: due || null,
					content,
				},
				{ onSuccess: onClose },
			);
		} else {
			createTask(
				{
					title: title.trim(),
					status,
					priority,
					labels: labelsArray,
					assignee: assignee.trim() || undefined,
					due: due || undefined,
					content,
				},
				{ onSuccess: onClose },
			);
		}
	}, [
		title,
		status,
		priority,
		labels,
		assignee,
		due,
		content,
		isEditing,
		task,
		createTask,
		updateTask,
		onClose,
	]);

	const handleDelete = useCallback(() => {
		if (!task) return;
		deleteTask(task.id, { onSuccess: onClose });
	}, [task, deleteTask, onClose]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isOpen) return;

			if (e.key === "Escape") {
				onClose();
			} else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				handleSave();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, handleSave]);

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
						{isEditing ? "Edit Task" : "New Task"}
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
							value={title}
							onChange={(e) => setTitle(e.target.value)}
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
								value={status}
								onChange={(e) => setStatus(e.target.value as TaskStatus)}
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
								value={priority}
								onChange={(e) => setPriority(e.target.value as TaskPriority)}
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
							value={labels}
							onChange={(e) => setLabels(e.target.value)}
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
								value={assignee}
								onChange={(e) => setAssignee(e.target.value)}
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
								value={due}
								onChange={(e) => setDue(e.target.value)}
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
							value={content}
							onChange={(e) => setContent(e.target.value)}
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
					{isEditing ? (
						showDeleteConfirm ? (
							<div className={cn("flex items-center gap-2")}>
								<span className={cn("text-sm text-red-600")}>
									Delete this task?
								</span>
								<button
									type="button"
									onClick={handleDelete}
									disabled={isPending}
									className={cn(
										"px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50",
									)}
								>
									{isDeleting ? "Deleting..." : "Yes, Delete"}
								</button>
								<button
									type="button"
									onClick={() => setShowDeleteConfirm(false)}
									disabled={isPending}
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
								onClick={() => setShowDeleteConfirm(true)}
								disabled={isPending}
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
							disabled={isPending}
							className={cn(
								"px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50",
							)}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSave}
							disabled={isPending || !title.trim()}
							className={cn(
								"px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
							)}
						>
							{isPending
								? isEditing
									? "Saving..."
									: "Creating..."
								: isEditing
									? "Save Changes"
									: "Create Task"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
