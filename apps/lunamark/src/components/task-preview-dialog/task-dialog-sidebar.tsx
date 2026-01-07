"use client";

import { User } from "lucide-react";
import {
	Avatar,
	FormControl,
	FormDescription,
	FormField,
	FormLabel,
	Input,
	Select,
} from "@ui/components";
import { getGitHubAvatarUrl } from "@/lib/github/avatar";
import type { useTaskEditorForm } from "@/hooks/task-editor/use-task-editor-form";
import type { TaskPriority, TaskStatus } from "@/schemas/task";

interface TaskDialogSidebarProps {
	form: ReturnType<typeof useTaskEditorForm>;
}

export function TaskDialogSidebar({ form }: TaskDialogSidebarProps) {
	return (
		<div className="w-72 flex-shrink-0 border-l border-[rgb(var(--color-neutral-stroke-1))/0.3] bg-[rgb(var(--color-neutral-background-2))/0.3] overflow-y-auto scrollbar-thin">
			<div className="p-5 space-y-5">
				<FormField>
					<FormLabel required>Title</FormLabel>
					<FormControl>
						{(inputProps) => (
							<Input
								{...inputProps}
								value={form.state.title}
								onChange={form.setField("title")}
								placeholder="Enter task title"
								className="text-sm"
							/>
						)}
					</FormControl>
				</FormField>

				<FormField>
					<FormLabel>Status</FormLabel>
					<FormControl>
						{(inputProps) => (
							<Select
								{...inputProps}
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
						)}
					</FormControl>
				</FormField>

				<FormField>
					<FormLabel>Priority</FormLabel>
					<FormControl>
						{(inputProps) => (
							<Select
								{...inputProps}
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
						)}
					</FormControl>
				</FormField>

				<FormField>
					<FormLabel>Assignee</FormLabel>
					<FormControl>
						{(inputProps) => (
							<div className="flex items-center gap-2">
								{form.state.avatarUrl ? (
									<Avatar
										src={form.state.avatarUrl}
										alt={form.state.assignee}
										size="sm"
									/>
								) : (
									<div className="w-8 h-8 rounded-full bg-[rgb(var(--color-neutral-background-3))] border border-dashed border-[rgb(var(--color-neutral-stroke-1))] flex items-center justify-center">
										<User className="w-4 h-4 text-[rgb(var(--color-neutral-foreground-2))]" />
									</div>
								)}
								<Input
									{...inputProps}
									value={form.state.assignee}
									onChange={form.setField("assignee")}
									onBlur={(e) => {
										const value = e.target.value.trim();
										if (value && !form.state.avatarUrl) {
											form.setFieldValue("avatarUrl")(
												getGitHubAvatarUrl(value),
											);
										}
									}}
									placeholder="GitHub username"
									className="flex-1 text-sm"
								/>
							</div>
						)}
					</FormControl>
				</FormField>

				<FormField>
					<FormLabel>Labels</FormLabel>
					<FormControl>
						{(inputProps) => (
							<Input
								{...inputProps}
								value={form.state.labels}
								onChange={form.setField("labels")}
								placeholder="bug, feature, urgent"
								className="text-sm"
							/>
						)}
					</FormControl>
					<FormDescription>Comma-separated values</FormDescription>
				</FormField>

				<FormField>
					<FormLabel>Due Date</FormLabel>
					<FormControl>
						{(inputProps) => (
							<Input
								{...inputProps}
								type="date"
								value={form.state.due}
								onChange={form.setField("due")}
								className="text-sm"
							/>
						)}
					</FormControl>
				</FormField>

				<FormField>
					<FormLabel>Avatar URL</FormLabel>
					<FormControl>
						{(inputProps) => (
							<Input
								{...inputProps}
								type="url"
								value={form.state.avatarUrl}
								onChange={form.setField("avatarUrl")}
								placeholder="https://github.com/username.png"
								className="text-sm"
							/>
						)}
					</FormControl>
					<FormDescription>
						Auto-filled from GitHub username
					</FormDescription>
				</FormField>
			</div>
		</div>
	);
}
