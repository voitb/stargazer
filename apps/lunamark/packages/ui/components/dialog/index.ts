// Compound components
export { Dialog } from "./dialog";
export { DialogContent } from "./dialog-content";
export { DialogHeader, DialogTitle, DialogDescription } from "./dialog-header";
export { DialogFooter } from "./dialog-footer";
export { DialogClose, CloseIcon } from "./dialog-close";

// Headless hook (for programmatic control)
export { useDialog } from "./use-dialog";

// Context (for advanced customization)
export { useDialogContext, DialogContext } from "./dialog.context";

// Behavior hook (for building custom dialogs)
export { useDialogBehavior } from "./use-dialog-behavior";

// Types
export type { DialogProps } from "./dialog";
export type { DialogContentProps } from "./dialog-content";
export type {
	DialogHeaderProps,
	DialogTitleProps,
	DialogDescriptionProps,
} from "./dialog-header";
export type { DialogFooterProps } from "./dialog-footer";
export type { DialogCloseProps } from "./dialog-close";
export type { DialogContextValue } from "./dialog.context";
export type { UseDialogOptions, UseDialogReturn } from "./use-dialog";
export type {
	UseDialogBehaviorOptions,
	UseDialogBehaviorReturn,
} from "./use-dialog-behavior";

// Variants (for styling customization)
export {
	dialogOverlayVariants,
	dialogContentVariants,
	dialogCloseVariants,
	dialogHeaderVariants,
	dialogTitleVariants,
	dialogDescriptionVariants,
	dialogFooterVariants,
} from "./dialog.variants";
