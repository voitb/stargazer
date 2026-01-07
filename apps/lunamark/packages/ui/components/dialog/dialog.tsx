"use client";

import { useMemo, type ReactNode } from "react";
import { DialogContext, type DialogContextValue } from "./dialog.context";
import { useDialog } from "./use-dialog";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnBackdropClick?: boolean;
  children: ReactNode;
};

export function Dialog({
  open,
  onOpenChange,
  closeOnBackdropClick = true,
  children,
}: DialogProps) {
  const dialog = useDialog({
    open,
    onOpenChange,
    closeOnBackdropClick,
  });

  const contextValue: DialogContextValue = useMemo(() => {
    return {
      open: dialog.open,
      onOpenChange: dialog.onOpenChange,
      titleId: dialog.titleId,
      descriptionId: dialog.descriptionId,
      contentRef: dialog.contentRef,
      shouldRender: dialog.shouldRender,
      handleBackdropClick: dialog.handleBackdropClick,
      dataState: dialog.dataState,
    };
  }, [
    dialog.open,
    dialog.onOpenChange,
    dialog.titleId,
    dialog.descriptionId,
    dialog.contentRef,
    dialog.shouldRender,
    dialog.handleBackdropClick,
    dialog.dataState,
  ]);

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}
