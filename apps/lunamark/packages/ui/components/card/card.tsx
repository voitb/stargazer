import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@ui/utils";
import { cardVariants } from "./card.variants";

type CardProps = ComponentProps<"div"> &
	VariantProps<typeof cardVariants>;

function Card({ className, variant, size, ref, ...props }: CardProps) {
	return (
		<div
			ref={ref}
			data-slot="card"
			className={cn(cardVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

export { Card };
export type { CardProps };
