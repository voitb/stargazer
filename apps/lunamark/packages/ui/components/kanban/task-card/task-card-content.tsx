"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { CardContent } from "@ui/components/card";
import { cn } from "@ui/utils";
import { taskCardContentVariants } from "./task-card.variants";

export type TaskCardContentProps = ComponentProps<"div"> &
	VariantProps<typeof taskCardContentVariants>;

export function TaskCardContent({
    className,
    children,
    ref,
    ...props
}: TaskCardContentProps) {
    return (
        <CardContent
            ref={ref}
            data-slot="task-card-content"
            className={cn(taskCardContentVariants(), className)}
            {...props}
        >
            {children}
        </CardContent>
    );
}
