import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@ui/components/badge";
import type { TaskPriority } from "@/schemas/task";

export const COLUMN_COLORS: Record<string, string> = {
	gray: "bg-[rgb(var(--color-neutral-foreground-3))]",
	blue: "bg-[rgb(var(--color-brand-background))]",
	yellow: "bg-[rgb(var(--color-status-warning))]",
	green: "bg-[rgb(var(--color-status-success))]",
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
