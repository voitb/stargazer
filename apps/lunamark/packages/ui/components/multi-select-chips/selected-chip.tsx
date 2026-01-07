"use client";

import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { chipVariants } from "./multi-select-chips.variants";

interface SelectedChipProps {
    label: string;
    size: "sm" | "md";
    onRemove: () => void;
}

function SelectedChip({ label, size, onRemove }: SelectedChipProps) {
    return (
        <button
            type="button"
            onClick={onRemove}
            data-state="selected"
            aria-pressed={true}
            className={cn(chipVariants({ variant: "selected", size }))}
        >
            {label}
            <X
                className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"}
                aria-hidden="true"
            />
        </button>
    );
}

export { SelectedChip };
export type { SelectedChipProps };
