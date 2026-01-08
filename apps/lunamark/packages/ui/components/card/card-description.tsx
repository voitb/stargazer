import type { ComponentProps } from "react";
import { cn } from "@ui/utils";

type CardDescriptionProps = ComponentProps<"p">;

function CardDescription({ className, ref, ...props }: CardDescriptionProps) {
    return (
        <p
            ref={ref}
            data-card-description
            className={cn(
                "text-sm text-[rgb(var(--color-neutral-foreground-2))]",
                className
            )}
            {...props}
        />
    );
}

export { CardDescription };
export type { CardDescriptionProps };
