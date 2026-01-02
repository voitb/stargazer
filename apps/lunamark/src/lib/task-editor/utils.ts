import type { TaskFormState } from "@/reducers/task-form-reducer";

export function parseLabels(labelsString: string): string[] {
	return labelsString
		.split(",")
		.map((l) => l.trim())
		.filter(Boolean);
}

export function buildCreatePayload(state: TaskFormState) {
	return {
		title: state.title.trim(),
		status: state.status,
		priority: state.priority,
		labels: parseLabels(state.labels),
		assignee: state.assignee.trim() || undefined,
		due: state.due || undefined,
		content: state.content,
	};
}

export function buildUpdatePayload(taskId: string, state: TaskFormState) {
	return {
		id: taskId,
		title: state.title.trim(),
		status: state.status,
		priority: state.priority,
		labels: parseLabels(state.labels),
		assignee: state.assignee.trim() || null,
		due: state.due || null,
		content: state.content,
	};
}
