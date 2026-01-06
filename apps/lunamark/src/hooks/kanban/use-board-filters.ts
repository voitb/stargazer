import { useNavigate, useSearch } from "@tanstack/react-router";
import type { TaskPriority } from "@/schemas/task";

export interface BoardFilters {
	assignee: string | null;
	priority: TaskPriority | null;
	labels: string[];
}

type SearchParams = {
	assignee?: string;
	priority?: TaskPriority;
	labels?: string[];
};

export function useBoardFilters() {
	const search = useSearch({ from: "/" }) as SearchParams;
	const navigate = useNavigate({ from: "/" });

	const filters: BoardFilters = {
		assignee: search.assignee ?? null,
		priority: search.priority ?? null,
		labels: search.labels ?? [],
	};

	const hasActiveFilters =
		filters.assignee !== null ||
		filters.priority !== null ||
		filters.labels.length > 0;

	function setAssignee(assignee: string | null) {
		navigate({
			to: "/",
			search: {
				...search,
				assignee: assignee ?? undefined,
			},
		});
	}

	function setPriority(priority: TaskPriority | null) {
		navigate({
			to: "/",
			search: {
				...search,
				priority: priority ?? undefined,
			},
		});
	}

	function toggleLabel(label: string) {
		const currentLabels = search.labels ?? [];
		const newLabels = currentLabels.includes(label)
			? currentLabels.filter((l) => l !== label)
			: [...currentLabels, label];
		navigate({
			to: "/",
			search: {
				...search,
				labels: newLabels.length > 0 ? newLabels : undefined,
			},
		});
	}

	function clearFilters() {
		navigate({
			to: "/",
			search: {},
		});
	}

	return {
		filters,
		hasActiveFilters,
		setAssignee,
		setPriority,
		toggleLabel,
		clearFilters,
	};
}
