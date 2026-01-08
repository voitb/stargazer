import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@ui/utils";
import { badgeVariants } from "./badge.variants";

type BadgeRenderProps = {
  className: string;
} & Pick<ComponentProps<"span">, "ref">;

type BadgeProps = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof badgeVariants> & {
    children?: ReactNode | ((props: BadgeRenderProps) => ReactNode);
  };

function Badge({
  className,
  variant,
  size,
  children,
  ref,
  ...props
}: BadgeProps) {
  const badgeClassName = cn(badgeVariants({ variant, size, className }));
  const renderProps: BadgeRenderProps = { className: badgeClassName, ref };

  if (typeof children === "function") {
    return <>{children(renderProps)}</>;
  }

  return (
    <span ref={ref} className={badgeClassName} data-slot="badge" {...props}>
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeRenderProps };
