"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { CardFooter } from "../../card";
import { cn } from "@ui/utils";
import { taskCardFooterVariants } from "./task-card.variants";

export type TaskCardFooterProps = ComponentProps<"div"> &
	VariantProps<typeof taskCardFooterVariants>;

export function TaskCardFooter({
    className,
    children,
    ref,
    ...props
}: TaskCardFooterProps) {
    return (
        <CardFooter
            ref={ref}
            data-slot="task-card-footer"
            className={cn(taskCardFooterVariants(), className)}
            {...props}
        >
            {children}
        </CardFooter>
    );
}
