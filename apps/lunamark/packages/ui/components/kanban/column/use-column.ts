"use client";

import { useCallback, useId } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { useControllableState } from "@ui/hooks/state/use-controllable-state";

export type UseColumnOptions<TItem = unknown> = {
  id: string;
  type?: string;
  accept?: string[];
  collisionPriority?: CollisionPriority;
  disabled?: boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  items?: TItem[];
};

export type UseColumnReturn<TItem = unknown> = {
  droppableRef: (element: HTMLElement | null) => void;
  isDropTarget: boolean;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  itemCount: number;
  isEmpty: boolean;
  dataState: "default" | "active" | "collapsed";
  contentId: string;
  getColumnProps: () => {
    role: "region";
    "data-state": "default" | "active" | "collapsed";
    "data-drop-target": boolean;
  };
  getHeaderProps: () => {
    "aria-expanded": boolean;
    "data-state": "default" | "active" | "collapsed";
  };
  getContentProps: () => {
    id: string;
    "aria-hidden": boolean;
    "data-state": "expanded" | "collapsed";
  };
  getCollapseButtonProps: () => {
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  };
};

export function useColumn<TItem = unknown>(
  options: UseColumnOptions<TItem>,
): UseColumnReturn<TItem> {
  const {
    id,
    type = "column",
    accept = ["item"],
    collisionPriority = CollisionPriority.Low,
    disabled = false,
    defaultCollapsed = false,
    collapsed: controlledCollapsed,
    onCollapsedChange,
    items = [],
  } = options;

  const contentId = useId();

  const [isCollapsed, setCollapsed] = useControllableState({
    value: controlledCollapsed,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  });

  const { ref: droppableRef, isDropTarget } = useDroppable({
    id,
    type,
    collisionPriority,
    accept,
    disabled: disabled || isCollapsed,
  });

  const itemCount = items.length;
  const isEmpty = itemCount === 0;

  const toggleCollapsed = useCallback(() => {
    setCollapsed(!isCollapsed);
  }, [isCollapsed, setCollapsed]);

  const dataState = isCollapsed
    ? "collapsed"
    : isDropTarget
      ? "active"
      : "default";

  return {
    droppableRef,
    isDropTarget,
    isCollapsed,
    setCollapsed,
    toggleCollapsed,
    itemCount,
    isEmpty,
    dataState,
    contentId,
    getColumnProps: () => ({
      role: "region" as const,
      "data-state": dataState,
      "data-drop-target": isDropTarget,
    }),
    getHeaderProps: () => ({
      "aria-expanded": !isCollapsed,
      "data-state": dataState,
    }),
    getContentProps: () => ({
      id: contentId,
      "aria-hidden": isCollapsed,
      "data-state": isCollapsed
        ? ("collapsed" as const)
        : ("expanded" as const),
    }),
    getCollapseButtonProps: () => ({
      "aria-expanded": !isCollapsed,
      "aria-controls": contentId,
      onClick: toggleCollapsed,
    }),
  };
}
