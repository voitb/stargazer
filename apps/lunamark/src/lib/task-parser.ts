import matter from "gray-matter";
import {
	type Task,
	type TaskMetadata,
	TaskMetadataSchema,
} from "@/schemas/task";

export type ParseResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: string; partial?: Partial<TaskMetadata> };

export function parseTask(
	filePath: string,
	content: string,
): ParseResult<Task> {
	try {
		const { data: rawFrontmatter, content: markdownBody } = matter(content);
		const validationResult = TaskMetadataSchema.safeParse(rawFrontmatter);

		if (!validationResult.success) {
			const errors = validationResult.error.issues
				.map((e) => `${e.path.join(".")}: ${e.message}`)
				.join(", ");

			return {
				ok: false,
				error: `Invalid frontmatter in ${filePath}: ${errors}`,
				partial: rawFrontmatter as Partial<TaskMetadata>,
			};
		}

		const metadata = validationResult.data;

		return {
			ok: true,
			data: {
				id: metadata.id,
				filePath,
				metadata,
				content: markdownBody.trim(),
			},
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return {
			ok: false,
			error: `Failed to parse ${filePath}: ${message}`,
		};
	}
}

export function serializeTask(task: Task): string {
	const frontmatter: Record<string, unknown> = {
		id: task.metadata.id,
		title: task.metadata.title,
		status: task.metadata.status,
		priority: task.metadata.priority,
		labels: task.metadata.labels,
		created: task.metadata.created,
		order: task.metadata.order,
	};

	if (task.metadata.assignee) {
		frontmatter.assignee = task.metadata.assignee;
	}
	if (task.metadata.due) {
		frontmatter.due = task.metadata.due;
	}

	return matter.stringify(task.content, frontmatter);
}

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 50);
}

export function generateFilename(id: string, title: string): string {
	const slug = slugify(title);
	return `${id}${slug ? `-${slug}` : ""}.md`;
}
