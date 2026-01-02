import type { Task, TaskPriority, TaskStatus } from "@/schemas/task";

export interface TaskFormState {
	title: string;
	status: TaskStatus;
	priority: TaskPriority;
	labels: string;
	assignee: string;
	due: string;
	content: string;
	showDeleteConfirm: boolean;
}

export type TaskFormAction =
	| {
			type: "SET_FIELD";
			field: "title" | "labels" | "assignee" | "due" | "content";
			value: string;
	  }
	| { type: "SET_STATUS"; value: TaskStatus }
	| { type: "SET_PRIORITY"; value: TaskPriority }
	| { type: "TOGGLE_DELETE_CONFIRM"; show: boolean };

export function taskFormReducer(
	state: TaskFormState,
	action: TaskFormAction,
): TaskFormState {
	switch (action.type) {
		case "SET_FIELD":
			return { ...state, [action.field]: action.value };
		case "SET_STATUS":
			return { ...state, status: action.value };
		case "SET_PRIORITY":
			return { ...state, priority: action.value };
		case "TOGGLE_DELETE_CONFIRM":
			return { ...state, showDeleteConfirm: action.show };
	}
}

export function createInitialFormState(
	task: Task | undefined,
	initialStatus: TaskStatus,
): TaskFormState {
	if (task) {
		return {
			title: task.metadata.title,
			status: task.metadata.status,
			priority: task.metadata.priority,
			labels: task.metadata.labels.join(", "),
			assignee: task.metadata.assignee ?? "",
			due: task.metadata.due ?? "",
			content: task.content,
			showDeleteConfirm: false,
		};
	}

	return {
		title: "",
		status: initialStatus,
		priority: "medium",
		labels: "",
		assignee: "",
		due: "",
		content: "",
		showDeleteConfirm: false,
	};
}
