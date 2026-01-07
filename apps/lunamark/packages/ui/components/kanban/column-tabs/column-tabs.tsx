import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@ui/utils";
import { columnTabVariants, columnTabsVariants } from "./column-tabs.variants";

interface ColumnTab {
  id: string;
  title: string;
  count: number;
  color?: string;
}

interface ColumnTabsProps extends ComponentProps<"div"> {
  tabs: ColumnTab[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  variant?: VariantProps<typeof columnTabsVariants>["variant"];
}

export function ColumnTabs({
  tabs,
  activeIndex,
  onTabChange,
  className,
  variant,
}: ColumnTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Kanban columns"
      className={cn(columnTabsVariants({ variant }), className)}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeIndex === index}
          aria-controls={`column-panel-${tab.id}`}
          tabIndex={activeIndex === index ? 0 : -1}
          onClick={() => onTabChange(index)}
          className={cn(
            columnTabVariants({
              state: activeIndex === index ? "active" : "inactive",
            }),
          )}
        >
          {tab.color && (
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: tab.color }}
              aria-hidden="true"
            />
          )}
          <span className="truncate">{tab.title}</span>
          <span className="ml-2 opacity-70" aria-label={`${tab.count} tasks`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export type { ColumnTab, ColumnTabsProps };
