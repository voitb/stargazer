"use client";

import { cn } from "../../utils/cn";
import { chipVariants } from "./multi-select-chips.variants";

interface UnselectedChipProps {
    label: string;
    size: "sm" | "md";
    onSelect: () => void;
}

function UnselectedChip({ label, size, onSelect }: UnselectedChipProps) {
    return (
        <button
            type="button"
            className={cn(chipVariants({ variant: "unselected", size }))}
            data-state="unselected"
            aria-pressed={false}
            onClick={onSelect}
        >
            {label}
        </button>
    );
}

export { UnselectedChip };
export type { UnselectedChipProps };
