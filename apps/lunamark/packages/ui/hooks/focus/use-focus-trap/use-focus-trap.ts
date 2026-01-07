"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "area[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]",
  "audio[controls]",
  "video[controls]",
  "summary",
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
  return Array.from(elements).filter(
    (el) =>
      el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden"
  );
}

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  isActive: boolean
): void {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const container = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== container && !el.contains(container)
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));

    const focusableElements = getFocusableElements(container);
    const firstFocusable = focusableElements[0];

    firstFocusable?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const currentFocusableElements = getFocusableElements(container);
      if (currentFocusableElements.length === 0) return;

      const first = currentFocusableElements[0];
      const last =
        currentFocusableElements[currentFocusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      siblings.forEach((el) => el.removeAttribute("inert"));
      previouslyFocused?.focus();
    };
  }, [isActive, ref]);
}
