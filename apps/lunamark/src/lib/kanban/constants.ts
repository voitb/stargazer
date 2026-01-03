import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import type { TaskPriority } from "@/schemas/task";

export const COLUMN_COLORS: Record<string, string> = {
	gray: "bg-gray-500",
	blue: "bg-blue-500",
	yellow: "bg-yellow-500",
	green: "bg-green-500",
};

export const PRIORITY_BADGE_VARIANTS: Record<
	TaskPriority,
	VariantProps<typeof badgeVariants>["variant"]
> = {
	low: "secondary",
	medium: "default",
	high: "warning",
	critical: "danger",
};

export const DND_TYPES = {
	ITEM: "item",
	COLUMN: "column",
} as const;

export const DRAG_ACTIVATION_DELAY = 150;
