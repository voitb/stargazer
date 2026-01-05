import { useEffect, useState } from "react";

/**
 * Delays unmounting to allow exit animations to complete.
 * Returns `shouldRender` which stays true during the exit animation duration.
 *
 * Pattern inspired by use-delayed-render (491B gzipped)
 * @see https://github.com/pacocoursey/use-delayed-render
 *
 * @param isOpen - Whether the element should be shown
 * @param duration - Animation duration in ms (default: 150)
 * @returns shouldRender - Keep element in DOM during exit animation
 *
 * @example
 * const shouldRender = useExitAnimation(isOpen, 150);
 * if (!shouldRender) return null;
 * return <div data-state={isOpen ? "open" : "closed"}>...</div>;
 */
export function useExitAnimation(isOpen: boolean, duration = 150) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    // Early return: if opening, immediately show
    if (isOpen) {
      setShouldRender(true);
      return;
    }

    // Closing: delay unmount for exit animation
    const timer = setTimeout(() => setShouldRender(false), duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration]);

  return shouldRender;
}
