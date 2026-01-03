"use client";

import { cn } from "@/lib/utils/cn";
import { useFocusTrap } from "@/hooks/ui/use-focus-trap";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	type ComponentProps,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type DialogContextValue = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	closeOnBackdropClick: boolean;
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

function Dialog({ open, onOpenChange, closeOnBackdropClick = true, children }: DialogProps) {
	return (
		<DialogContext.Provider value={{ isOpen: open, onOpenChange, closeOnBackdropClick }}>
			{children}
		</DialogContext.Provider>
	);
}

type DialogContentProps = ComponentProps<"div">;

function DialogContent({ className, children, ref, ...props }: DialogContentProps) {
	const { isOpen, onOpenChange, closeOnBackdropClick } = useDialogContext();
	const contentRef = useRef<HTMLDivElement>(null);

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
		// Update internal ref
		contentRef.current = node;
		// Forward ref to parent
		if (typeof ref === "function") {
			ref(node);
		} else if (ref) {
			(ref as React.RefObject<HTMLDivElement | null>).current = node;
		}
	};

	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			onClick={handleBackdropClick}
		>
			{/* Backdrop/Overlay */}
			<div
				data-dialog-overlay
				className="fixed inset-0 bg-black/50 animate-fade-in"
				aria-hidden="true"
			/>

			{/* Content */}
			<div
				ref={combinedRef}
				role="dialog"
				aria-modal="true"
				data-dialog-content
				className={cn(
					"relative z-50 grid w-full max-w-lg gap-4 border p-6 shadow-lg",
					"bg-[rgb(var(--ui-bg))] text-[rgb(var(--ui-fg))] border-[rgb(var(--ui-border))]",
					"rounded-lg",
					"animate-zoom-in",
					className
				)}
				{...props}
			>
				{children}

				{/* Close button */}
				<button
					type="button"
					className={cn(
						"absolute right-4 top-4 rounded-sm opacity-70 transition-opacity",
						"hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ui-border))]",
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
			className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

function DialogTitle({ className, ref, ...props }: ComponentProps<"h2">) {
	return (
		<h2
			ref={ref}
			className={cn("text-lg font-semibold leading-none tracking-tight", className)}
			{...props}
		/>
	);
}

function DialogDescription({ className, ref, ...props }: ComponentProps<"p">) {
	return (
		<p
			ref={ref}
			className={cn("text-sm text-[rgb(var(--ui-fg))]/70", className)}
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

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
