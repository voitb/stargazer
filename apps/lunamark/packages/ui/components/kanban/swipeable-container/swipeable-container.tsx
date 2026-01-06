import type { ReactNode } from "react";
import { cn } from "@ui/utils";
import { useSwipeNavigation } from "@ui/hooks/use-swipe-navigation";

interface SwipeableContainerProps {
  children: ReactNode[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
  ariaLive?: "off" | "polite" | "assertive";
}

export function SwipeableContainer({
  children,
  activeIndex,
  onIndexChange,
  className,
  ariaLive = "polite",
}: SwipeableContainerProps) {
  const { handleTouchStart, handleTouchMove, handleTouchEnd, containerRef } =
    useSwipeNavigation({
      itemCount: children.length,
      activeIndex,
      onIndexChange,
      enableKeyboard: true,
    });

  // Get active tab info for screen reader announcement
  const activeChild = children[activeIndex] as React.ReactElement<{ 'aria-label'?: string }> | null;
  const activeTabLabel =
    activeChild?.props?.["aria-label"] || "Column " + String(activeIndex + 1);

  return (
    <div
      ref={containerRef}
      className={cn("flex-1 overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // Accessibility: announce column changes to screen readers
      role="region"
      aria-live={ariaLive}
      aria-atomic="true"
      aria-label={"Showing " + activeTabLabel}
    >
      <div
        className="flex transition-transform duration-300 ease-out h-full"
        style={{ transform: "translateX(-" + String(activeIndex * 100) + "%)" }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full shrink-0 h-full"
            role="tabpanel"
            id={"column-panel-" + String(index)}
            aria-labelledby={"tab-" + String(index)}
            tabIndex={activeIndex === index ? 0 : -1}
            hidden={activeIndex !== index}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
