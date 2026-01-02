import type { TaskPriority } from "@/schemas/task";

export const COLUMN_COLORS: Record<string, string> = {
	gray: "bg-gray-500",
	blue: "bg-blue-500",
	yellow: "bg-yellow-500",
	green: "bg-green-500",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
	low: "bg-gray-100 text-gray-600",
	medium: "bg-blue-100 text-blue-600",
	high: "bg-orange-100 text-orange-600",
	critical: "bg-red-100 text-red-600",
};

export const DND_TYPES = {
	ITEM: "item",
	COLUMN: "column",
} as const;

export const DRAG_ACTIVATION_DELAY = 150;
