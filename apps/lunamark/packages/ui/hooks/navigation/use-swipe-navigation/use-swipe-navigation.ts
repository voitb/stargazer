"use client";

import { useRef, useEffect, type RefObject } from "react";

interface UseSwipeNavigationOptions {
  itemCount: number;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  threshold?: number;
  enableKeyboard?: boolean;
}

type SwipeTouchEvent = {
  touches: {
    length: number;
    [index: number]: { clientX: number };
  };
};

interface UseSwipeNavigationReturn {
  handleTouchStart: (e: SwipeTouchEvent) => void;
  handleTouchMove: (e: SwipeTouchEvent) => void;
  handleTouchEnd: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function useSwipeNavigation({
  itemCount,
  activeIndex,
  onIndexChange,
  threshold = 50,
  enableKeyboard = true,
}: UseSwipeNavigationOptions): UseSwipeNavigationReturn {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleTouchStart(e: SwipeTouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: SwipeTouchEvent) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && activeIndex < itemCount - 1) {
        onIndexChange(activeIndex + 1);
      } else if (diff < 0 && activeIndex > 0) {
        onIndexChange(activeIndex - 1);
      }
    }
  }

  useEffect(() => {
    if (!enableKeyboard || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        e.preventDefault();
        onIndexChange(activeIndex - 1);
      } else if (e.key === "ArrowRight" && activeIndex < itemCount - 1) {
        e.preventDefault();
        onIndexChange(activeIndex + 1);
      }
    };

    const container = containerRef.current;
    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, itemCount, onIndexChange, enableKeyboard]);

  return { handleTouchStart, handleTouchMove, handleTouchEnd, containerRef };
}
