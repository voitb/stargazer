import type { Task } from '@/schemas/task'

// Gap-based ordering strategy for efficient reordering
// Using gaps of 10 allows insertions without reordering all tasks
export const ORDER_GAP = 10

/**
 * Calculate new order based on index position
 * Order: 10, 20, 30, etc.
 */
export function calculateNewOrder(index: number): number {
  return (index + 1) * ORDER_GAP
}

/**
 * Get order value for inserting at a specific position
 * Calculates midpoint between adjacent tasks
 */
export function getInsertOrder(items: Task[], targetIndex: number): number {
  if (items.length === 0) return ORDER_GAP

  const prev = items[targetIndex - 1]?.metadata.order ?? 0
  const next = items[targetIndex]?.metadata.order ?? prev + ORDER_GAP * 2

  return Math.floor((prev + next) / 2)
}
