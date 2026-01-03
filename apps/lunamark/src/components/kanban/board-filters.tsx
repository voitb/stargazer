import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterGroup } from "@/components/ui/filter-group";
import { SelectableButton } from "@/components/ui/selectable-button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PRIORITY_BADGE_VARIANTS } from "@/lib/kanban/constants";
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
				<SelectableButton
					size="sm"
					variant="ghost"
					isSelected={filters.assignee === null}
					onClick={() => onAssigneeChange(null)}
					aria-label="Show all assignees"
				>
					All
				</SelectableButton>
				<AvatarGroup max={5} size="sm">
					{assignees.map((assignee) => (
						<SelectableButton
							key={assignee.name}
							size="sm"
							variant="ghost"
							isSelected={filters.assignee === assignee.name}
							onClick={() =>
								onAssigneeChange(
									filters.assignee === assignee.name ? null : assignee.name,
								)
							}
							aria-label={`Filter by ${assignee.name}`}
							className="rounded-full p-0"
						>
							<Avatar size="sm" src={assignee.avatarUrl} alt={assignee.name} />
						</SelectableButton>
					))}
				</AvatarGroup>
			</FilterGroup>

			<FilterGroup label="Priority">
				<ToggleGroup
					type="single"
					value={filters.priority}
					onValueChange={(value) => onPriorityChange(value as TaskPriority | null)}
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
				<ToggleGroup
					type="multiple"
					values={filters.labels}
					onValuesChange={(values) => {
						const added = values.find((v) => !filters.labels.includes(v));
						const removed = filters.labels.find((l) => !values.includes(l));
						if (added) onLabelToggle(added);
						if (removed) onLabelToggle(removed);
					}}
					size="sm"
				>
					{labels.slice(0, 6).map((label) => (
						<ToggleGroupItem
							key={label}
							value={label}
							aria-label={`Toggle ${label} label filter`}
							className="rounded-full p-0 bg-transparent hover:bg-transparent"
						>
							<Badge
								variant="outline"
								size="sm"
								className="text-[10px] font-medium cursor-pointer"
							>
								{label}
							</Badge>
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				{labels.length > 6 && (
					<Badge variant="secondary" size="sm" className="text-[10px]">
						+{labels.length - 6}
					</Badge>
				)}
			</FilterGroup>
		</FilterBar>
	);
}
