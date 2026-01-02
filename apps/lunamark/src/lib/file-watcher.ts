import type { FSWatcher } from "chokidar";
import chokidar from "chokidar";

export type FileEvent = "add" | "change" | "unlink";

export interface FileChange {
	type: FileEvent;
	path: string;
	timestamp: number;
}

export interface FileWatcher {
	start: () => Promise<void>;
	stop: () => Promise<void>;
	onChange: (callback: (change: FileChange) => void) => () => void;
}

export function createFileWatcher(tasksDir: string): FileWatcher {
	let watcher: FSWatcher | null = null;
	const callbacks = new Set<(change: FileChange) => void>();

	const notify = (type: FileEvent, path: string) => {
		const change: FileChange = { type, path, timestamp: Date.now() };
		for (const cb of callbacks) {
			cb(change);
		}
	};

	return {
		async start() {
			if (watcher) return;

			watcher = chokidar.watch(`${tasksDir}/**/*.md`, {
				persistent: true,
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 50,
				},
				ignored: /(^|[/\\])\.|\.swp$|~$/,
			});

			watcher.on("add", (path) => notify("add", path));
			watcher.on("change", (path) => notify("change", path));
			watcher.on("unlink", (path) => notify("unlink", path));

			await new Promise<void>((resolve) => watcher?.on("ready", resolve));
		},

		async stop() {
			if (watcher) {
				await watcher.close();
				watcher = null;
			}
			callbacks.clear();
		},

		onChange(callback) {
			callbacks.add(callback);
			return () => callbacks.delete(callback);
		},
	};
}
