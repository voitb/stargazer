import type { ComponentProps } from "react";
import { cn } from "@ui/utils";

type CardFooterProps = ComponentProps<"div">;

function CardFooter({ className, ref, ...props }: CardFooterProps) {
    return (
        <div
            ref={ref}
            data-slot="card-footer"
            className={cn("flex items-center p-6 pt-0", className)}
            {...props}
        />
    );
}

export { CardFooter };
export type { CardFooterProps };
