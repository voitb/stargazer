import { useState } from "react";
import type { Task, TaskStatus } from "@/schemas/task";

interface TaskEditorState {
	isOpen: boolean;
	task?: Task;
	initialStatus?: TaskStatus;
}

export function useTaskEditor() {
	const [editorState, setEditorState] = useState<TaskEditorState>({
		isOpen: false,
	});

	function openCreate(status: TaskStatus) {
		setEditorState({ isOpen: true, initialStatus: status });
	}

	function openEdit(task: Task) {
		setEditorState({ isOpen: true, task });
	}

	function close() {
		setEditorState({ isOpen: false });
	}

	return {
		isOpen: editorState.isOpen,
		task: editorState.task,
		initialStatus: editorState.initialStatus,
		openCreate,
		openEdit,
		close,
	};
}
