---
id: task-152
title: Fix hardcoded colors in text.tsx DECISION_DISPLAY
status: done
priority: critical
labels:
  - cli
  - design-system
  - bug-fix
created: '2025-01-10'
order: 152
assignee: ai-agent
depends_on: []
---

## Description

The `DECISION_DISPLAY` constant in text.tsx has hardcoded hex colors instead of using the existing `statusColors` tokens.

## Problem

**File:** `packages/cli/src/tui/design-system/components/text.tsx`

Lines 281-297 have hardcoded colors:
```typescript
export const DECISION_DISPLAY = {
  approve: {
    icon: STAR_ICONS.filled,
    color: '#4ade80', // HARDCODED - should use statusColors.success.text
    label: 'Approved',
  },
  request_changes: {
    icon: STAR_ICONS.circle,
    color: '#f87171', // HARDCODED - should use statusColors.error.text
    label: 'Changes Requested',
  },
  comment: {
    icon: STAR_ICONS.diamond,
    color: '#38bdf8', // HARDCODED - should use statusColors.info.text
    label: 'Comment',
  },
} as const;
```

## Acceptance Criteria

- [ ] `DECISION_DISPLAY` uses `statusColors` tokens
- [ ] No hardcoded hex colors
- [ ] DecisionText component still works correctly
- [ ] TypeScript types remain correct

## Implementation

**File:** `packages/cli/src/tui/design-system/components/text.tsx`

### Step 1: Ensure statusColors is imported

Check that at the top of the file there is:
```typescript
import { statusColors, STAR_ICONS } from '../tokens/colors.js';
```

If STAR_ICONS is imported from palettes.js, keep that import. Just make sure statusColors is imported.

### Step 2: Update DECISION_DISPLAY

Replace the hardcoded colors:

```typescript
/**
 * Decision display configuration
 * Maps review decisions to visual representation
 */
export const DECISION_DISPLAY = {
  approve: {
    icon: STAR_ICONS.filled,
    color: statusColors.success.text,
    label: 'Approved',
  },
  request_changes: {
    icon: STAR_ICONS.circle,
    color: statusColors.error.text,
    label: 'Changes Requested',
  },
  comment: {
    icon: STAR_ICONS.diamond,
    color: statusColors.info.text,
    label: 'Comment',
  },
} as const;
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

## Verification

After implementation:
1. Check that review results display shows correct colors
2. Verify DecisionText component renders properly
3. Test all three decision types (approve, request_changes, comment)

## Files Changed

- `packages/cli/src/tui/design-system/components/text.tsx`
