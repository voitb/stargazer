import { avatarVariants, SelectableAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterGroup } from "@/components/ui/filter-group";
import { MultiSelectChips } from "@/components/ui/multi-select-chips";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PRIORITY_BADGE_VARIANTS } from "@/lib/kanban/constants";
import { cn } from "@/lib/utils/cn";
import type { TaskPriority } from "@/schemas/task";

interface Assignee {
	name: string;
	avatarUrl?: string | null;
}

interface BoardFiltersProps {
	assignees: Assignee[];
	labels: string[];
	filters: {
		assignee: string | null;
		priority: TaskPriority | null;
		labels: string[];
	};
	hasActiveFilters: boolean;
	onAssigneeChange: (assignee: string | null) => void;
	onPriorityChange: (priority: TaskPriority | null) => void;
	onLabelToggle: (label: string) => void;
	onClearFilters: () => void;
}

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "critical"];

export function BoardFilters({
	assignees,
	labels,
	filters,
	hasActiveFilters,
	onAssigneeChange,
	onPriorityChange,
	onLabelToggle,
	onClearFilters,
}: BoardFiltersProps) {
	if (assignees.length === 0 && labels.length === 0) {
		return null;
	}

	return (
		<FilterBar hasActiveFilters={hasActiveFilters} onClear={onClearFilters}>
			<FilterGroup label="Assignee" visible={assignees.length > 0}>
				<div className="flex -space-x-2">
					{assignees.slice(0, 5).map((assignee) => (
						<SelectableAvatar
							key={assignee.name}
							size="sm"
							src={assignee.avatarUrl}
							alt={assignee.name}
							isSelected={filters.assignee === assignee.name}
							onClick={() =>
								onAssigneeChange(
									filters.assignee === assignee.name ? null : assignee.name,
								)
							}
							aria-label={`Filter by ${assignee.name}`}
							className="ring-2 ring-[rgb(var(--ui-bg))]"
						/>
					))}
					{assignees.length > 5 && (
						<span
							data-slot="avatar"
							className={cn(
								avatarVariants({ size: "sm" }),
								"ring-2 ring-[rgb(var(--ui-bg))] bg-[rgb(var(--ui-bg-secondary))]",
							)}
						>
							+{assignees.length - 5}
						</span>
					)}
				</div>
			</FilterGroup>

			<FilterGroup label="Priority">
				<ToggleGroup
					type="single"
					value={filters.priority}
					onValueChange={(value) =>
						onPriorityChange(value as TaskPriority | null)
					}
					size="sm"
				>
					{PRIORITIES.map((priority) => (
						<ToggleGroupItem
							key={priority}
							value={priority}
							aria-label={`Filter by ${priority} priority`}
							className="rounded-full p-0 bg-transparent hover:bg-transparent"
						>
							<Badge
								variant={PRIORITY_BADGE_VARIANTS[priority]}
								size="sm"
								className="uppercase text-[10px] font-bold tracking-wide cursor-pointer"
							>
								{priority}
							</Badge>
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</FilterGroup>

			<FilterGroup label="Labels" visible={labels.length > 0}>
				<MultiSelectChips
					values={filters.labels}
					onToggle={onLabelToggle}
					options={labels.map((label) => ({ value: label, label }))}
					maxDisplay={6}
					size="sm"
				/>
			</FilterGroup>
		</FilterBar>
	);
}
