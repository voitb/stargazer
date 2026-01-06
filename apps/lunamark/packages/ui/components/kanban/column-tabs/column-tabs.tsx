import { cn } from "@ui/utils";

interface ColumnTab {
  id: string;
  title: string;
  count: number;
  color?: string;
}

interface ColumnTabsProps {
  tabs: ColumnTab[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  className?: string;
}

export function ColumnTabs({
  tabs,
  activeIndex,
  onTabChange,
  className,
}: ColumnTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Kanban columns"
      className={cn(
        "flex gap-2 px-4 py-3",
        "overflow-x-auto scrollbar-none",
        "sticky top-0 z-10",
        "bg-[rgb(var(--color-neutral-background-1))/0.9]",
        "backdrop-blur-md",
        "border-b border-[rgb(var(--color-neutral-stroke-1))/0.2]",
        className,
      )}
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
            "flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-brand-background))/0.5]",
            "min-h-11", // Accessibility: minimum touch target
            activeIndex === index
              ? "bg-[rgb(var(--color-brand-background))] text-[rgb(var(--color-brand-foreground-on-brand))] shadow-md"
              : "bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-2))] hover:bg-[rgb(var(--color-neutral-background-3))/0.8]",
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
