interface DropIndicatorProps {
  isVisible: boolean
}

/**
 * Visual indicator showing where a dragged task will be dropped
 *
 * Renders a blue horizontal line that appears between tasks
 * when dragging over a valid drop position.
 */
export function DropIndicator({ isVisible }: DropIndicatorProps) {
  if (!isVisible) return null

  return (
    <div className="h-1 bg-blue-500 rounded-full mx-1 my-1 transition-all duration-150 animate-pulse" />
  )
}
