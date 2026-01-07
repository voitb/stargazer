"use client";

import type { ComponentProps } from "react";
import { CardContent } from "../../card";
import { cn } from "../../../utils/cn";
import { taskCardContentVariants } from "./task-card.variants";

export type TaskCardContentProps = ComponentProps<"div">;

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
