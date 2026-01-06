---
id: task-033
title: Create ConventionPattern type
status: done
priority: medium
labels:
  - core
  - conventions
created: '2026-01-01'
order: 87.5
assignee: voitb
---
## Description

Create the type definitions for convention patterns that will be discovered.

## Acceptance Criteria

- [x] Create `packages/core/src/conventions/types.ts`
- [x] Define ConventionPattern type
- [x] Define ProjectConventions type

## Implementation

**File**: `packages/core/src/conventions/types.ts`

```typescript
/**
 * A single coding convention pattern discovered in the project.
 */
export type ConventionPattern = {
  readonly name: string;
  readonly description: string;
  readonly examples: readonly string[];
};

/**
 * All discovered conventions for a project.
 */
export type ProjectConventions = {
  readonly patterns: readonly ConventionPattern[];
  readonly discoveredAt: string; // ISO timestamp
};
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
