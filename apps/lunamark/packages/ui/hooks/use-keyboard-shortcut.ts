import { useEffect } from "react";

export interface KeyboardShortcutConfig {
	key: string | string[];
	handler: (event: KeyboardEvent) => void;
	enabled?: boolean;
	ignoreInputFields?: boolean;
}

function isInputField(element: HTMLElement): boolean {
	return (
		element.tagName === "INPUT" ||
		element.tagName === "TEXTAREA" ||
		element.isContentEditable ||
		element.getAttribute("contenteditable") === "true"
	);
}

export function useKeyboardShortcut(config: KeyboardShortcutConfig): void {
	const { key, handler, enabled = true, ignoreInputFields = true } = config;

	useEffect(() => {
		if (!enabled) return;

		const keys = Array.isArray(key) ? key : [key];
		const normalizedKeys = keys.map((k) => k.toLowerCase());

		function handleKeyDown(event: KeyboardEvent) {
			if (ignoreInputFields && isInputField(event.target as HTMLElement)) {
				return;
			}

			if (normalizedKeys.includes(event.key.toLowerCase())) {
				handler(event);
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [key, handler, enabled, ignoreInputFields]);
}
