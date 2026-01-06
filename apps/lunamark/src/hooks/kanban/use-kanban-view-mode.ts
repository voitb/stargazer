import { useState, useEffect } from "react";

type ViewMode = "mobile" | "tablet" | "desktop";

const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
} as const;

export function useKanbanViewMode(): ViewMode {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Initialize with correct value to avoid hydration mismatch
    if (typeof window === "undefined") return "desktop";
    const width = window.innerWidth;
    if (width < BREAKPOINTS.tablet) return "mobile";
    if (width < BREAKPOINTS.desktop) return "tablet";
    return "desktop";
  });

  useEffect(() => {
    const updateViewMode = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.tablet) {
        setViewMode("mobile");
      } else if (width < BREAKPOINTS.desktop) {
        setViewMode("tablet");
      } else {
        setViewMode("desktop");
      }
    };

    updateViewMode();
    window.addEventListener("resize", updateViewMode);
    return () => window.removeEventListener("resize", updateViewMode);
  }, []);

  return viewMode;
}
