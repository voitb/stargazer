---
id: task-132
title: Create layers (z-index) tokens
status: pending
priority: medium
labels:
  - cli
  - design-system
  - tokens
created: '2025-01-09'
order: 132
assignee: glm
depends_on:
  - task-129
---

## Description

Create z-index/layering tokens for proper stacking order of overlays, modals, and toasts.
In terminal UIs, this is conceptual but helps organize component rendering order.

## Reference

See: `packages/cli/CLI_DESIGN_SYSTEM.md` - Design Tokens section

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/design-system/tokens/layers.ts`
- [ ] Define layer scale (base, elevated, dropdown, modal, toast)
- [ ] Export type-safe layer tokens
- [ ] Add JSDoc documentation

## Implementation

**File**: `packages/cli/src/tui/design-system/tokens/layers.ts`

```typescript
/**
 * Stargazer CLI Design System - Layer Tokens
 *
 * Z-index scale for component stacking order.
 * In terminal UIs, this is conceptual - helps organize rendering priority.
 *
 * @example
 * ```typescript
 * import { layers } from './layers.js';
 *
 * // Use to determine rendering order
 * const renderOrder = [
 *   { component: 'content', layer: layers.base },
 *   { component: 'modal', layer: layers.modal },
 *   { component: 'toast', layer: layers.toast },
 * ].sort((a, b) => a.layer - b.layer);
 * ```
 */

/**
 * Layer scale for component stacking
 *
 * | Layer     | Value | Use Case |
 * |-----------|-------|----------|
 * | base      | 0     | Main content, backgrounds |
 * | elevated  | 10    | Cards, raised surfaces |
 * | dropdown  | 20    | Menus, dropdowns |
 * | sticky    | 30    | Fixed headers, status bars |
 * | modal     | 40    | Modal dialogs |
 * | overlay   | 50    | Full-screen overlays |
 * | toast     | 60    | Notifications (always on top) |
 */
export const layers = {
  /** Base content layer */
  base: 0,
  /** Elevated surfaces (cards, panels) */
  elevated: 10,
  /** Dropdown menus, select lists */
  dropdown: 20,
  /** Fixed/sticky elements (headers, status bars) */
  sticky: 30,
  /** Modal dialogs */
  modal: 40,
  /** Full-screen overlays */
  overlay: 50,
  /** Toast notifications (always visible) */
  toast: 60,
} as const;

export type LayerToken = keyof typeof layers;
export type LayerValue = (typeof layers)[LayerToken];

/**
 * Get layer value by token name
 */
export function getLayer(token: LayerToken): LayerValue {
  return layers[token];
}

/**
 * Check if layer A should render above layer B
 */
export function isAbove(layerA: LayerToken, layerB: LayerToken): boolean {
  return layers[layerA] > layers[layerB];
}

/**
 * Sort items by their layer (ascending - base renders first)
 */
export function sortByLayer<T extends { layer: LayerToken }>(items: T[]): T[] {
  return [...items].sort((a, b) => layers[a.layer] - layers[b.layer]);
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

## Usage Example

```typescript
import { layers, isAbove } from '../design-system/tokens/layers.js';

// Determine if toast should render above modal
if (isAbove('toast', 'modal')) {
  // Toast wins - render on top
}

// Sort components for rendering
const components = [
  { name: 'content', layer: 'base' as const },
  { name: 'toast', layer: 'toast' as const },
  { name: 'header', layer: 'sticky' as const },
];

const renderOrder = sortByLayer(components);
// [content, header, toast]
```
