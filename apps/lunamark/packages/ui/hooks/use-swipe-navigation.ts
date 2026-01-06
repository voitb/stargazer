import { useRef, useCallback, useEffect } from "react";

interface UseSwipeNavigationOptions {
  itemCount: number;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  threshold?: number;
  enableKeyboard?: boolean; // For arrow key navigation
}

interface UseSwipeNavigationReturn {
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && activeIndex < itemCount - 1) {
        onIndexChange(activeIndex + 1);
      } else if (diff < 0 && activeIndex > 0) {
        onIndexChange(activeIndex - 1);
      }
    }
  }, [activeIndex, itemCount, onIndexChange, threshold]);

  // Keyboard navigation for accessibility
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
