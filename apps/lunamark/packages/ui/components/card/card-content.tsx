import type { ComponentProps } from "react";
import { cn } from "@ui/utils";

type CardContentProps = ComponentProps<"div">;

function CardContent({ className, ref, ...props }: CardContentProps) {
    return (
        <div
            ref={ref}
            data-slot="card-content"
            className={cn("p-6 pt-0", className)}
            {...props}
        />
    );
}

export { CardContent };
export type { CardContentProps };
