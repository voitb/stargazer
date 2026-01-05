import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

type CardProps = ComponentProps<"div">;
type CardHeaderProps = ComponentProps<"div">;
type CardTitleProps = ComponentProps<"h3">;
type CardDescriptionProps = ComponentProps<"p">;
type CardContentProps = ComponentProps<"div">;
type CardFooterProps = ComponentProps<"div">;

function Card({ className, ref, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "rounded-lg border bg-[rgb(var(--color-neutral-background-1))] text-[rgb(var(--color-neutral-foreground-1))] shadow-sm",
        "border-[rgb(var(--color-neutral-stroke-1))]",
        className
      )}
      {...props}
    />
  );
}

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

function CardTitle({ className, ref, ...props }: CardTitleProps) {
  return (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ref, ...props }: CardDescriptionProps) {
  return (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn(
        "text-sm text-[rgb(var(--color-neutral-foreground-2))]",
        className
      )}
      {...props}
    />
  );
}

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

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

export type {
  CardProps,
  CardHeaderProps,
  CardFooterProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
};
