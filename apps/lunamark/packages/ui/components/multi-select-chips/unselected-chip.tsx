"use client";

import type { VariantProps } from "class-variance-authority";
import { cn } from "@ui/utils";
import { chipVariants } from "./multi-select-chips.variants";

type ChipVariantProps = VariantProps<typeof chipVariants>;

interface UnselectedChipProps {
    label: string;
    size: ChipVariantProps["size"];
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
