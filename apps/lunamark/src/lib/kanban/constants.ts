/**
 * Column header colors based on status
 */
export const COLUMN_COLORS: Record<string, string> = {
  gray: 'bg-gray-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
}

/**
 * DnD type identifiers
 */
export const DND_TYPES = {
  ITEM: 'item',
  COLUMN: 'column',
} as const

/**
 * Drag activation delay in milliseconds
 */
export const DRAG_ACTIVATION_DELAY = 150
