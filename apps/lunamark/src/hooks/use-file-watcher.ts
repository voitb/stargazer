import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { FileChange } from "@/lib/file-watcher";
import { BOARD_QUERY_KEY } from "./kanban/use-board";

type WatchMessage = FileChange | { type: "connected" };

interface UseFileWatcherOptions {
	enabled?: boolean;
	debounceMs?: number;
}

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 1000;
const BACKOFF_MULTIPLIER = 1.5;

export function useFileWatcher(options: UseFileWatcherOptions = {}): void {
	const { enabled = true, debounceMs = 200 } = options;
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!enabled || typeof window === "undefined") return;

		let eventSource: EventSource | null = null;
		let debounceTimer: ReturnType<typeof setTimeout> | null = null;
		let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
		let reconnectCount = 0;

		const scheduleReconnect = () => {
			if (reconnectCount >= MAX_RETRIES) return;

			const delay = RETRY_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, reconnectCount);
			reconnectCount += 1;
			reconnectTimeout = setTimeout(connect, delay);
		};

		const handleMessage = (event: MessageEvent) => {
			const message = JSON.parse(event.data) as WatchMessage;
			if (message.type === "connected") return;

			const isFileChange =
				message.type === "add" ||
				message.type === "change" ||
				message.type === "unlink";

			if (!isFileChange) return;

			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY });
			}, debounceMs);
		};

		const connect = () => {
			if (eventSource) return;

			eventSource = new EventSource("/api/watch");

			eventSource.onopen = () => {
				reconnectCount = 0;
			};

			eventSource.onmessage = handleMessage;

			eventSource.onerror = () => {
				eventSource?.close();
				eventSource = null;
				scheduleReconnect();
			};
		};

		connect();

		return () => {
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
			if (debounceTimer) clearTimeout(debounceTimer);
			eventSource?.close();
		};
	}, [enabled, debounceMs, queryClient]);
}
