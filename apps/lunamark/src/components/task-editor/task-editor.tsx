"use client";

import { useTaskEditorForm } from "@/hooks/task-editor/use-task-editor-form";
import { getGitHubAvatarUrl } from "@/lib/github/avatar";
import type { Task, TaskPriority, TaskStatus } from "@/schemas/task";
import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Select,
	Textarea,
} from "@ui/components";

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
	const form = useTaskEditorForm({ task, initialStatus, isOpen, onClose });

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{form.isEditing ? "Edit Task" : "New Task"}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title" required>
							Title
						</Label>
						<Input
							id="title"
							type="text"
							value={form.state.title}
							onChange={form.setField("title")}
							placeholder="Enter task title"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Select
								id="status"
								value={form.state.status}
								onValueChange={(value) =>
									form.setStatusValue(value as TaskStatus)
								}
							>
								<option value="todo">To Do</option>
								<option value="in-progress">In Progress</option>
								<option value="review">Review</option>
								<option value="done">Done</option>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="priority">Priority</Label>
							<Select
								id="priority"
								value={form.state.priority}
								onValueChange={(value) =>
									form.setPriorityValue(value as TaskPriority)
								}
							>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
								<option value="critical">Critical</option>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="labels">Labels</Label>
						<Input
							id="labels"
							type="text"
							value={form.state.labels}
							onChange={form.setField("labels")}
							placeholder="bug, feature, urgent (comma separated)"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="assignee">Assignee</Label>
							<Input
								id="assignee"
								type="text"
								value={form.state.assignee}
								onChange={form.setField("assignee")}
								onBlur={(e) => {
									const value = e.target.value.trim();
									if (value && !form.state.avatarUrl) {
										form.setFieldValue("avatarUrl")(getGitHubAvatarUrl(value));
									}
								}}
								placeholder="GitHub username (e.g., voitb)"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="due">Due Date</Label>
							<Input
								id="due"
								type="date"
								value={form.state.due}
								onChange={form.setField("due")}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="avatarUrl">Avatar URL</Label>
						<Input
							id="avatarUrl"
							type="url"
							value={form.state.avatarUrl}
							onChange={form.setField("avatarUrl")}
							placeholder="https://github.com/username.png"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="content">Description (Markdown)</Label>
						<Textarea
							id="content"
							value={form.state.content}
							onChange={form.setField("content")}
							placeholder="## Description&#10;&#10;Add task details..."
							rows={6}
							className="font-mono"
						/>
					</div>
				</div>

				<DialogFooter className="flex-row justify-between sm:justify-between">
					<div>
						{form.isEditing && (
							<>
								{form.state.showDeleteConfirm ? (
									<div className="flex items-center gap-2">
										<span className="text-sm text-[rgb(var(--color-status-danger))]">
											Delete this task?
										</span>
										<Button
											variant="danger"
											size="sm"
											onClick={form.handleDelete}
											isLoading={form.isDeleting}
											disabled={form.isPending}
										>
											Yes, Delete
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => form.toggleDeleteConfirm(false)}
											disabled={form.isPending}
										>
											Cancel
										</Button>
									</div>
								) : (
									<Button
										variant="link"
										onClick={() => form.toggleDeleteConfirm(true)}
										disabled={form.isPending}
										className="text-[rgb(var(--color-status-danger))] hover:text-[rgb(var(--color-status-danger))]"
									>
										Delete task
									</Button>
								)}
							</>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={onClose}
							disabled={form.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={form.handleSave}
							disabled={!form.canSave}
							isLoading={form.isPending && !form.isDeleting}
						>
							{form.isEditing ? "Save Changes" : "Create Task"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
