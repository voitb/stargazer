export interface DropIndicatorProps {
  isVisible: boolean;
}

export function DropIndicator({ isVisible }: DropIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="h-1 bg-[rgb(var(--color-brand-background))] rounded-full mx-1 my-1 transition-all duration-150 animate-pulse" />
  );
}
