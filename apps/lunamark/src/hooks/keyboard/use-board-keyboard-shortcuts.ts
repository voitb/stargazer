import type { TaskStatus } from "@/schemas/task";
import { useKeyboardShortcut } from "@ui/hooks";

export interface BoardKeyboardShortcutsConfig {
	onCreateTask: (status: TaskStatus) => void;
	enabled?: boolean;
}

export function useBoardKeyboardShortcuts(
	config: BoardKeyboardShortcutsConfig,
): void {
	const { onCreateTask, enabled = true } = config;

	useKeyboardShortcut({
		key: ["n", "N"],
		handler: (event) => {
			event.preventDefault();
			onCreateTask("todo");
		},
		enabled,
	});
}
