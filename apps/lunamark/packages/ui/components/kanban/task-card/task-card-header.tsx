"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { CardHeader } from "../../card";
import { cn } from "@ui/utils";
import { taskCardHeaderVariants } from "./task-card.variants";

export type TaskCardHeaderProps = ComponentProps<"div"> &
	VariantProps<typeof taskCardHeaderVariants>;

export function TaskCardHeader({
    className,
    children,
    ref,
    ...props
}: TaskCardHeaderProps) {
    return (
        <CardHeader
            ref={ref}
            data-slot="task-card-header"
            className={cn(taskCardHeaderVariants(), className)}
            {...props}
        >
            {children}
        </CardHeader>
    );
}
