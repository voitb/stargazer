import type { ComponentProps } from "react";
import { cn } from "@ui/utils";

type CardTitleProps = ComponentProps<"h3">;

function CardTitle({ className, ref, ...props }: CardTitleProps) {
    return (
        <h3
            ref={ref}
            data-card-title
            className={cn(
                "text-2xl font-semibold leading-none tracking-tight",
                className
            )}
            {...props}
        />
    );
}

export { CardTitle };
export type { CardTitleProps };
