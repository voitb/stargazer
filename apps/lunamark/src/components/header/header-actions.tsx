import { Plus } from "lucide-react";
import { Button, KeyboardHint } from "@ui/components";
import { cn } from "@/lib/utils/cn";

interface HeaderActionsProps {
	onAddTask: () => void;
}

export function HeaderActions({ onAddTask }: HeaderActionsProps) {
	return (
		<div className="flex items-center gap-3">
			<Button
				variant="primary"
				size="sm"
				className={cn(
					"gap-2",
					// Premium gradient background
					"bg-gradient-to-r from-[rgb(var(--color-brand-background))] to-[rgb(var(--color-brand-background))/0.85]",
					// Glow shadow
					"shadow-md shadow-[rgb(var(--color-brand-background))/0.25]",
					// Hover enhancement
					"hover:shadow-lg hover:shadow-[rgb(var(--color-brand-background))/0.35]",
					"hover:from-[rgb(var(--color-brand-background))/0.95] hover:to-[rgb(var(--color-brand-background))/0.8]",
					// Press effect
					"active:scale-[0.98]",
					"transition-all duration-200"
				)}
				onClick={onAddTask}
			>
				<Plus className="w-4 h-4" />
				<span className="font-medium">Add Task</span>
				<KeyboardHint keys={["N"]} variant="inverted" className="ml-1" />
			</Button>
		</div>
	);
}
