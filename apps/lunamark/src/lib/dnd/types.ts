import type { DragOperation } from "@dnd-kit/abstract";
import type { Draggable, Droppable } from "@dnd-kit/dom";
import type { Task, TaskStatus } from "@/schemas/task";

type Operation = DragOperation<Draggable, Droppable>;

export interface DragStartEvent {
	cancelable: false;
	operation: Operation;
	nativeEvent?: Event;
}

export interface DragOverEvent {
	cancelable: boolean;
	defaultPrevented: boolean;
	preventDefault(): void;
	operation: Operation;
}

export interface DragEndEvent {
	operation: Operation;
	nativeEvent?: Event;
	canceled: boolean;
	suspend(): { resume(): void; abort(): void };
}

export interface DragState {
	activeTask: Task | null;
	isDragging: boolean;
}

export interface BoardState {
	items: Record<TaskStatus, string[]>;
	tasksMap: Map<string, Task>;
}

export interface DragHandlers {
	handleDragStart: (event: DragStartEvent) => void;
	handleDragOver: (event: DragOverEvent) => void;
	handleDragEnd: (event: DragEndEvent) => void;
}

export type { Task, TaskStatus };
