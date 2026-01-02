import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { BOARD_QUERY_KEY } from "./use-board";

interface UseFileWatcherOptions {
	enabled?: boolean;
	debounceMs?: number;
}

export function useFileWatcher(options: UseFileWatcherOptions = {}) {
	const { enabled = true, debounceMs = 200 } = options;
	const queryClient = useQueryClient();
	const eventSourceRef = useRef<EventSource | null>(null);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const invalidateBoard = useCallback(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(() => {
			queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY });
		}, debounceMs);
	}, [queryClient, debounceMs]);

	useEffect(() => {
		if (typeof window === "undefined" || !enabled) return;

		const eventSource = new EventSource("/api/watch");
		eventSourceRef.current = eventSource;

		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				if (data.type === "connected") {
					return;
				}

				if (
					data.type === "add" ||
					data.type === "change" ||
					data.type === "unlink"
				) {
					invalidateBoard();
				}
			} catch {}
		};

		return () => {
			eventSource.close();
			eventSourceRef.current = null;

			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
				debounceTimerRef.current = null;
			}
		};
	}, [enabled, invalidateBoard]);
}
