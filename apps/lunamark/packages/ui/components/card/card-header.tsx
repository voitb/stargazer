import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

type CardHeaderProps = ComponentProps<"div">;

function CardHeader({ className, ref, ...props }: CardHeaderProps) {
    return (
        <div
            ref={ref}
            data-slot="card-header"
            className={cn("flex flex-col space-y-1.5 p-6", className)}
            {...props}
        />
    );
}

export { CardHeader };
export type { CardHeaderProps };
