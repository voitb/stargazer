"use client";

import { useTaskEditorForm } from "@/hooks/task-editor/use-task-editor-form";
import type { Task, TaskPriority, TaskStatus } from "@/schemas/task";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
								<SelectItem value="todo">To Do</SelectItem>
								<SelectItem value="in-progress">In Progress</SelectItem>
								<SelectItem value="review">Review</SelectItem>
								<SelectItem value="done">Done</SelectItem>
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
								<SelectItem value="low">Low</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="high">High</SelectItem>
								<SelectItem value="critical">Critical</SelectItem>
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
								placeholder="Name"
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
										<span className="text-sm text-[rgb(var(--ui-danger))]">
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
										className="text-[rgb(var(--ui-danger))] hover:text-[rgb(var(--ui-danger))]"
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
