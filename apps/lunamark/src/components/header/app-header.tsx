import { HeaderActions } from "./header-actions";
import { HeaderLogo } from "./header-logo";
import { HeaderStats } from "./header-stats";
import type { Board } from "@/schemas/task";

interface AppHeaderProps {
	board: Board;
	onAddTask: () => void;
}

export function AppHeader({ board, onAddTask }: AppHeaderProps) {
	return (
		<header
			className="sticky top-0 z-40 border-b border-[rgb(var(--color-neutral-stroke-1))/50]"
			data-header
		>
			<div className="flex items-center justify-between h-16 px-6 max-w-full">
				<HeaderLogo />
				<HeaderStats board={board} />
				<HeaderActions onAddTask={onAddTask} />
			</div>
		</header>
	);
}
