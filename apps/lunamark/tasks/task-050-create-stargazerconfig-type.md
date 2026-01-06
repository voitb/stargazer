---
id: task-050
title: Create StargazerConfig type
status: todo
assignee: voitb
priority: high
labels:
  - core
  - config
created: '2026-01-01'
order: 500
---
## Description

Create the configuration type definitions for Stargazer.

## Acceptance Criteria

- [ ] Create `packages/core/src/config/types.ts`
- [ ] Define StargazerConfig type
- [ ] Define ResolvedConfig type (all fields required)
- [ ] Include model, severity, plugins options

## Implementation

**File**: `packages/core/src/config/types.ts`

```typescript
import type { StargazerPlugin } from '../plugins/types';
import type { Model } from '../gemini/models';
import type { Severity } from '../review/schemas';

/**
 * User-facing configuration for Stargazer.
 * All fields are optional and will use defaults if not specified.
 */
export type StargazerConfig = {
  /** Gemini model to use */
  readonly model?: Model;

  /** Minimum severity to report (filters out lower severity issues) */
  readonly minSeverity?: Severity;

  /** Maximum number of issues to report */
  readonly maxIssues?: number;

  /** Glob patterns for files to ignore */
  readonly ignore?: readonly string[];

  /** Plugins to apply during review */
  readonly plugins?: readonly StargazerPlugin[];
};

/**
 * Fully resolved configuration with all defaults applied.
 * Used internally after merging user config with defaults.
 */
export type ResolvedConfig = {
  readonly model: Model;
  readonly minSeverity: Severity;
  readonly maxIssues: number;
  readonly ignore: readonly string[];
  readonly plugins: readonly StargazerPlugin[];
};
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
