import type { VariantProps } from "class-variance-authority";
import {
  Children,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { avatarVariants } from "./avatar.variants";

type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

type AvatarProps = ComponentProps<"span"> &
  VariantProps<typeof avatarVariants> & {
    src?: string | null;
    alt?: string;
    fallback?: ReactNode;
    delayMs?: number;
    onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
  };

function Avatar({
  size,
  src,
  alt,
  fallback,
  delayMs = 0,
  onLoadingStatusChange,
  className,
  ref,
  ...props
}: AvatarProps) {
  const [status, setStatus] = useState<ImageLoadingStatus>(
    src ? "loading" : "idle"
  );
  const [canShowFallback, setCanShowFallback] = useState(delayMs === 0);

  useLayoutEffect(() => {
    if (!src) {
      setStatus("idle");
      onLoadingStatusChange?.("idle");
      setCanShowFallback(true);
      return;
    }

    setStatus("loading");
    onLoadingStatusChange?.("loading");

    if (delayMs === 0) {
      setCanShowFallback(true);
    } else {
      setCanShowFallback(false);
      const timer = setTimeout(() => setCanShowFallback(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [src, delayMs, onLoadingStatusChange]);

  const handleLoad = () => {
    setStatus("loaded");
    onLoadingStatusChange?.("loaded");
  };

  const handleError = () => {
    setStatus("error");
    onLoadingStatusChange?.("error");
  };

  const fallbackContent = fallback ?? alt?.[0]?.toUpperCase() ?? "?";
  const showImage = src && status !== "error";
  const showFallback = !showImage && canShowFallback;

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
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : showFallback ? (
        <span className="select-none">{fallbackContent}</span>
      ) : null}
    </span>
  );
}

type AvatarGroupProps = ComponentProps<"div"> & {
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
        "*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-[rgb(var(--color-neutral-background-1))]",
        className
      )}
      {...props}
    >
      {visibleAvatars.map((avatar, index) =>
        cloneElement(avatar as ReactElement<AvatarProps>, {
          key: index,
          size,
        })
      )}
      {overflowCount > 0 && (
        <span
          data-slot="avatar"
          className={cn(
            avatarVariants({ size }),
            "ring-2 ring-[rgb(var(--color-neutral-background-1))] bg-[rgb(var(--color-neutral-background-2))]"
          )}
        >
          +{overflowCount}
        </span>
      )}
    </div>
  );
}

type SelectableAvatarProps = ComponentProps<"button"> &
  VariantProps<typeof avatarVariants> & {
    src?: string | null;
    alt?: string;
    fallback?: ReactNode;
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
        "focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
        className
      )}
      {...props}
    >
      <Avatar
        size={size}
        src={src}
        alt={alt}
        fallback={fallback}
        className={cn(
          isSelected &&
            "ring-2 ring-[rgb(var(--color-brand-background))] ring-offset-1"
        )}
      />
    </button>
  );
}

export { Avatar, AvatarGroup, SelectableAvatar };
export type {
  AvatarProps,
  AvatarGroupProps,
  SelectableAvatarProps,
  ImageLoadingStatus,
};
