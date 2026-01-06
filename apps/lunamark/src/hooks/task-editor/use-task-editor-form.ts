import { useEffect, useReducer } from "react";
import { useCreateTask, useDeleteTask, useUpdateTask } from "@/hooks/tasks";
import {
	buildCreatePayload,
	buildUpdatePayload,
} from "@/lib/task-editor/utils";
import {
	createInitialFormState,
	taskFormReducer,
} from "@/reducers/task-form-reducer";
import type { Task, TaskPriority, TaskStatus } from "@/schemas/task";

interface UseTaskEditorFormProps {
	task?: Task;
	initialStatus: TaskStatus;
	isOpen: boolean;
	onClose: () => void;
}

export function useTaskEditorForm({
	task,
	initialStatus,
	isOpen,
	onClose,
}: UseTaskEditorFormProps) {
	const isEditing = Boolean(task);

	const [state, dispatch] = useReducer(
		taskFormReducer,
		{ task, initialStatus },
		({ task, initialStatus }) => createInitialFormState(task, initialStatus),
	);

	const { mutate: createTask, isPending: isCreating } = useCreateTask();
	const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
	const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

	const isPending = isCreating || isUpdating || isDeleting;
	const canSave = state.title.trim().length > 0 && !isPending;

	function setField(field: "title" | "labels" | "assignee" | "avatarUrl" | "due" | "content") {
		return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			dispatch({ type: "SET_FIELD", field, value: e.target.value });
		};
	}

	function setFieldValue(field: "title" | "labels" | "assignee" | "avatarUrl" | "due" | "content") {
		return (value: string) => {
			dispatch({ type: "SET_FIELD", field, value });
		};
	}

	function setStatus(e: React.ChangeEvent<HTMLSelectElement>) {
		dispatch({ type: "SET_STATUS", value: e.target.value as TaskStatus });
	}

	function setStatusValue(value: TaskStatus) {
		dispatch({ type: "SET_STATUS", value });
	}

	function setPriority(e: React.ChangeEvent<HTMLSelectElement>) {
		dispatch({ type: "SET_PRIORITY", value: e.target.value as TaskPriority });
	}

	function setPriorityValue(value: TaskPriority) {
		dispatch({ type: "SET_PRIORITY", value });
	}

	function toggleDeleteConfirm(show: boolean) {
		dispatch({ type: "TOGGLE_DELETE_CONFIRM", show });
	}

	function handleSave() {
		if (!canSave) return;

		if (isEditing && task) {
			updateTask(buildUpdatePayload(task.id, state), { onSuccess: onClose });
			return;
		}

		createTask(buildCreatePayload(state), { onSuccess: onClose });
	}

	function handleDelete() {
		if (!task) return;
		deleteTask(task.id, { onSuccess: onClose });
	}

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (!isOpen) return;

			if (e.key === "Escape") {
				onClose();
				return;
			}

			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				handleSave();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	});

	return {
		state,
		isEditing,
		isPending,
		isDeleting,
		canSave,
		setField,
		setFieldValue,
		setStatus,
		setStatusValue,
		setPriority,
		setPriorityValue,
		toggleDeleteConfirm,
		handleSave,
		handleDelete,
	};
}
