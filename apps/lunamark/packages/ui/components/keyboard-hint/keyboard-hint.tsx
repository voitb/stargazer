import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Fragment } from "react";
import { cn } from "@ui/utils";
import { keyboardHintVariants } from "./keyboard-hint.variants";

type KeyboardHintProps = Omit<ComponentProps<"span">, "children"> &
	VariantProps<typeof keyboardHintVariants> & {
		keys: string[];
	};

function KeyboardHint({
	keys,
	variant,
	size,
	className,
	ref,
	...props
}: KeyboardHintProps) {
	const keyClass = keyboardHintVariants({ variant, size });

	return (
		<span
			data-keyboard-hint
			ref={ref}
			className={cn("inline-flex items-center gap-0.5", className)}
			{...props}
		>
			{keys.map((key, index) => (
				<Fragment key={key}>
					{index > 0 && (
						<span className="text-[rgb(var(--color-neutral-foreground-3))]">
							+
						</span>
					)}
					<kbd className={keyClass}>{key}</kbd>
				</Fragment>
			))}
		</span>
	);
}

export { KeyboardHint };
export type { KeyboardHintProps };
