import { createFileRoute } from "@tanstack/react-router";
import { getTasksDir, resolveConfigSync } from "../../lib/config";
import {
	createFileWatcher,
	type FileChange,
	type FileWatcher,
} from "../../lib/file-watcher";

let watcher: FileWatcher | null = null;
const clients = new Set<(change: FileChange) => void>();

async function ensureWatcher(): Promise<void> {
	if (!watcher) {
		const config = resolveConfigSync();
		const tasksDir = getTasksDir(config);

		watcher = createFileWatcher(tasksDir);
		await watcher.start();

		watcher.onChange((change) => {
			for (const client of clients) {
				client(change);
			}
		});
	}
}

export const Route = createFileRoute("/api/watch")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				await ensureWatcher();

				const encoder = new TextEncoder();

				const stream = new ReadableStream({
					start(controller) {
						const send = (change: FileChange) => {
							try {
								const data = `data: ${JSON.stringify(change)}\n\n`;
								controller.enqueue(encoder.encode(data));
							} catch {}
						};

						controller.enqueue(
							encoder.encode('data: {"type":"connected"}\n\n'),
						);

						const heartbeat = setInterval(() => {
							try {
								controller.enqueue(encoder.encode(": heartbeat\n\n"));
							} catch {
								clearInterval(heartbeat);
							}
						}, 30000);

						clients.add(send);

						request.signal.addEventListener("abort", () => {
							clients.delete(send);
							clearInterval(heartbeat);
							try {
								controller.close();
							} catch {}
						});
					},
				});

				return new Response(stream, {
					headers: {
						"Content-Type": "text/event-stream",
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
					},
				});
			},
		},
	},
});
