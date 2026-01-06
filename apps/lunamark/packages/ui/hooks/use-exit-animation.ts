"use client";

import { useEffect, useState } from "react";

export function useExitAnimation(isOpen: boolean, duration = 150) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return;
    }

    const timer = setTimeout(() => setShouldRender(false), duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration]);

  return shouldRender;
}
