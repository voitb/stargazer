"use client";

import { cn } from "../../utils/cn";
import { useExitAnimation } from "../../hooks/use-exit-animation";
import { useFocusTrap } from "../../hooks/use-focus-trap";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type DialogContextValue = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnBackdropClick: boolean;
  titleId: string;
  descriptionId: string;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog provider");
  }
  return context;
}

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnBackdropClick?: boolean;
  children: ReactNode;
};

function Dialog({
  open,
  onOpenChange,
  closeOnBackdropClick = true,
  children,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <DialogContext.Provider
      value={{ isOpen: open, onOpenChange, closeOnBackdropClick, titleId, descriptionId }}
    >
      {children}
    </DialogContext.Provider>
  );
}

type DialogContentProps = ComponentProps<"div">;

function DialogContent({
  className,
  children,
  ref,
  ...props
}: DialogContentProps) {
  const { isOpen, onOpenChange, closeOnBackdropClick, titleId, descriptionId } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);

  const shouldRender = useExitAnimation(isOpen, 150);

  useFocusTrap(contentRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onOpenChange]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onOpenChange(false);
      }
    },
    [closeOnBackdropClick, onOpenChange]
  );

  const combinedRef = (node: HTMLDivElement | null) => {
    contentRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as React.RefObject<HTMLDivElement | null>).current = node;
    }
  };

  const dataState = isOpen ? "open" : "closed";

  if (!shouldRender) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-state={dataState}
      onClick={handleBackdropClick}
    >
      <div
        data-dialog-overlay
        data-state={dataState}
        className="fixed inset-0 bg-[rgb(var(--color-overlay)/0.5)]"
        aria-hidden="true"
      />

      <div
        ref={combinedRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-dialog-content
        data-state={dataState}
        className={cn(
          "relative z-50 w-full max-w-lg gap-4 border p-6 shadow-lg",
          "bg-[rgb(var(--color-neutral-background-1))] text-[rgb(var(--color-neutral-foreground-1))] border-[rgb(var(--color-neutral-stroke-1))]",
          "rounded-lg",
          className
        )}
        {...props}
      >
        {children}

        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          className={cn(
            "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity",
            "hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
            "disabled:pointer-events-none"
          )}
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>
    </div>,
    document.body
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function DialogHeader({ className, ref, ...props }: ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ref, ...props }: ComponentProps<"h2">) {
  const { titleId } = useDialogContext();

  return (
    <h2
      id={titleId}
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({ className, ref, ...props }: ComponentProps<"p">) {
  const { descriptionId } = useDialogContext();

  return (
    <p
      id={descriptionId}
      ref={ref}
      className={cn(
        "text-sm text-[rgb(var(--color-neutral-foreground-1))]/70",
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ref, ...props }: ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};

export type { DialogProps };
