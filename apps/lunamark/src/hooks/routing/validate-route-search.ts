import type { TaskPriority } from "@/schemas/task";

export interface RouteSearchParams {
	assignee?: string;
	priority?: TaskPriority;
	labels?: string[];
}

export const VALID_PRIORITIES = ["low", "medium", "high", "critical"] as const;

export function isValidPriority(value: unknown): value is TaskPriority {
	return (
		typeof value === "string" &&
		VALID_PRIORITIES.includes(value as TaskPriority)
	);
}

export function validateRouteSearch(
	search: Record<string, unknown>,
): RouteSearchParams {
	return {
		assignee:
			typeof search.assignee === "string" ? search.assignee : undefined,
		priority: isValidPriority(search.priority) ? search.priority : undefined,
		labels: Array.isArray(search.labels)
			? search.labels.filter((l): l is string => typeof l === "string")
			: undefined,
	};
}
