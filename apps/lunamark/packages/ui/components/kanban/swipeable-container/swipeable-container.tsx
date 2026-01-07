"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useSwipeNavigation } from "@ui/hooks/navigation/use-swipe-navigation";
import { cn, mergeRefs } from "@ui/utils";

export type SwipeableContainerProps = ComponentProps<"div"> & {
  children: ReactNode[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  ariaLive?: "off" | "polite" | "assertive";
};

export function SwipeableContainer({
  children,
  activeIndex,
  onIndexChange,
  className,
  ariaLive = "polite",
  ref,
  ...props
}: SwipeableContainerProps) {
  const { handleTouchStart, handleTouchMove, handleTouchEnd, containerRef } =
    useSwipeNavigation({
      itemCount: children.length,
      activeIndex,
      onIndexChange,
      enableKeyboard: true,
    });

  const combinedRef = mergeRefs(containerRef, ref);

  const activeChild = children[activeIndex] as
    | ReactElement<{ "aria-label"?: string }>
    | undefined;
  const activeTabLabel =
    activeChild?.props?.["aria-label"] || "Column " + String(activeIndex + 1);

  return (
    <div
      ref={combinedRef}
      className={cn("flex-1 overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-live={ariaLive}
      aria-atomic="true"
      aria-label={"Showing " + activeTabLabel}
      {...props}
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
