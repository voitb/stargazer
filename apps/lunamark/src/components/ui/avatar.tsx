import { cva, type VariantProps } from "class-variance-authority";
import {
	Children,
	cloneElement,
	isValidElement,
	useState,
	type ComponentPropsWithoutRef,
	type ReactElement,
	type ReactNode,
	type Ref,
} from "react";
import { cn } from "@/lib/utils/cn";

const avatarVariants = cva(
	"relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[rgb(var(--ui-bg-tertiary))] text-[rgb(var(--ui-fg-muted))] font-medium",
	{
		variants: {
			size: {
				sm: "w-6 h-6 text-[10px]",
				md: "w-8 h-8 text-xs",
				lg: "w-10 h-10 text-sm",
			},
		},
		defaultVariants: { size: "md" },
	},
);

type AvatarProps = ComponentPropsWithoutRef<"span"> &
	VariantProps<typeof avatarVariants> & {
		ref?: Ref<HTMLSpanElement>;
		src?: string | null;
		alt?: string;
		fallback?: string;
	};

function Avatar({
	size,
	src,
	alt,
	fallback,
	className,
	ref,
	...props
}: AvatarProps) {
	const [hasError, setHasError] = useState(false);

	const fallbackText = fallback ?? alt?.[0]?.toUpperCase() ?? "?";
	const showImage = src && !hasError;

	return (
		<span
			ref={ref}
			data-slot="avatar"
			className={cn(avatarVariants({ size }), className)}
			{...props}
		>
			{showImage ? (
				<img
					src={src}
					alt={alt ?? ""}
					className="h-full w-full object-cover"
					onError={() => setHasError(true)}
				/>
			) : (
				<span className="select-none">{fallbackText}</span>
			)}
		</span>
	);
}

type AvatarGroupProps = ComponentPropsWithoutRef<"div"> & {
	ref?: Ref<HTMLDivElement>;
	max?: number;
	size?: VariantProps<typeof avatarVariants>["size"];
	children: ReactNode;
};

function AvatarGroup({
	max = 4,
	size = "md",
	children,
	className,
	ref,
	...props
}: AvatarGroupProps) {
	const avatars = Children.toArray(children).filter(isValidElement);
	const visibleAvatars = avatars.slice(0, max);
	const overflowCount = avatars.length - max;

	return (
		<div
			ref={ref}
			className={cn(
				"flex -space-x-2",
				"*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-[rgb(var(--ui-bg))]",
				className,
			)}
			{...props}
		>
			{visibleAvatars.map((avatar, index) =>
				cloneElement(avatar as ReactElement<AvatarProps>, {
					key: index,
					size,
				}),
			)}
			{overflowCount > 0 && (
				<span
					data-slot="avatar"
					className={cn(
						avatarVariants({ size }),
						"ring-2 ring-[rgb(var(--ui-bg))] bg-[rgb(var(--ui-bg-secondary))]",
					)}
				>
					+{overflowCount}
				</span>
			)}
		</div>
	);
}

type SelectableAvatarProps = ComponentPropsWithoutRef<"button"> &
	VariantProps<typeof avatarVariants> & {
		ref?: Ref<HTMLButtonElement>;
		src?: string | null;
		alt?: string;
		fallback?: string;
		isSelected?: boolean;
	};

function SelectableAvatar({
	size,
	src,
	alt,
	fallback,
	isSelected = false,
	className,
	ref,
	...props
}: SelectableAvatarProps) {
	return (
		<button
			ref={ref}
			type="button"
			data-slot="avatar"
			aria-pressed={isSelected}
			data-state={isSelected ? "on" : "off"}
			className={cn(
				"relative cursor-pointer transition-all rounded-full",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
				"focus-visible:ring-[rgb(var(--ui-border-focus))]",
				className,
			)}
			{...props}
		>
			<Avatar
				size={size}
				src={src}
				alt={alt}
				fallback={fallback}
				className={cn(
					isSelected && "ring-2 ring-[rgb(var(--ui-primary))] ring-offset-1",
				)}
			/>
		</button>
	);
}

export { Avatar, AvatarGroup, SelectableAvatar, avatarVariants };
