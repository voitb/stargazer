"use client";

import { useState, useEffect } from "react";
import { useTaskEditorForm } from "@/hooks/task-editor/use-task-editor-form";
import type { Task, TaskStatus } from "@/schemas/task";
import { Button, Dialog, DialogContent } from "@ui/components";
import { TaskDialogHeader } from "./task-dialog-header";
import { TaskDialogContent } from "./task-dialog-content";
import { TaskDialogSidebar } from "./task-dialog-sidebar";

interface TaskPreviewDialogProps {
	task?: Task;
	initialStatus?: TaskStatus;
	isOpen: boolean;
	onClose: () => void;
}

export function TaskPreviewDialog({
	task,
	initialStatus = "todo",
	isOpen,
	onClose,
}: TaskPreviewDialogProps) {
	const form = useTaskEditorForm({ task, initialStatus, isOpen, onClose });

	// Existing tasks open in preview mode, new tasks in edit mode
	const [mode, setMode] = useState<"preview" | "edit">(
		form.isEditing ? "preview" : "edit"
	);

	// Reset mode when dialog opens/closes or task changes
	useEffect(() => {
		if (isOpen) {
			setMode(form.isEditing ? "preview" : "edit");
		}
	}, [isOpen, form.isEditing]);

	// Keyboard shortcut to toggle mode
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (!isOpen) return;

			// Cmd/Ctrl + E to toggle edit mode
			if ((e.metaKey || e.ctrlKey) && e.key === "e") {
				e.preventDefault();
				setMode((m) => (m === "edit" ? "preview" : "edit"));
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
				{/* Header with mode toggle */}
				<TaskDialogHeader
					taskId={task?.metadata.id}
					isEditing={form.isEditing}
					mode={mode}
					onModeChange={setMode}
				/>

				{/* Two-panel layout */}
				<div className="flex flex-1 min-h-0">
					{/* Main content panel (left) */}
					<TaskDialogContent
						mode={mode}
						content={form.state.content}
						onChange={form.setField("content")}
					/>

					{/* Sidebar panel (right) */}
					<TaskDialogSidebar form={form} />
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-6 py-4 border-t border-[rgb(var(--color-neutral-stroke-1))/0.3] bg-[rgb(var(--color-neutral-background-2))/0.3]">
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

					<div className="flex items-center gap-3">
						<span className="text-xs text-[rgb(var(--color-neutral-foreground-2))]">
							<kbd className="px-1.5 py-0.5 text-xs font-mono bg-[rgb(var(--color-neutral-background-3))] rounded border border-[rgb(var(--color-neutral-stroke-1))/0.5]">
								⌘
							</kbd>
							{" + "}
							<kbd className="px-1.5 py-0.5 text-xs font-mono bg-[rgb(var(--color-neutral-background-3))] rounded border border-[rgb(var(--color-neutral-stroke-1))/0.5]">
								Enter
							</kbd>
							{" to save"}
						</span>
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
				</div>
			</DialogContent>
		</Dialog>
	);
}
