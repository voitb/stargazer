---
id: task-091
title: Add config schema validation
status: done
priority: low
labels:
  - core
  - config
created: '2026-01-06'
order: 910
assignee: voitb
---
## Description

Add Zod schema for config validation to catch invalid configurations early.

## Issue Details

**File**: `/packages/core/src/config/types.ts`
**Confidence**: 75%
**Category**: Validation

Unlike review types, there's no Zod schema for config validation. This means invalid config values won't be caught until runtime.

## Acceptance Criteria

- [x] Create `StargazerConfigSchema` with validation rules
- [x] Add bounds checking for numeric values
- [x] Validate enum values (severity, model)
- [x] Use `satisfies` pattern for type alignment

## Implementation

**File**: `packages/core/src/config/schemas.ts`

```typescript
import * as z from 'zod/v4';
import { SEVERITIES } from '../review/types';
import { MODELS } from '../gemini/models';

export const StargazerConfigSchema = z.object({
  /** Minimum severity to report */
  minSeverity: z.enum(SEVERITIES).optional(),

  /** Maximum issues to report (1-100) */
  maxIssues: z
    .number()
    .int()
    .min(1, 'maxIssues must be at least 1')
    .max(100, 'maxIssues cannot exceed 100')
    .optional(),

  /** Gemini model to use */
  model: z.enum(MODELS).optional(),

  /** Paths to ignore (glob patterns) */
  ignore: z.array(z.string()).optional(),

  /** Plugins to apply */
  plugins: z.array(z.any()).optional(), // Plugin validation is complex
});

export type StargazerConfigFromSchema = z.infer<typeof StargazerConfigSchema>;
```

**File**: `packages/core/src/config/resolve.ts`

```typescript
import { StargazerConfigSchema } from './schemas';

export function resolveConfig(userConfig: unknown): Result<ResolvedConfig> {
  const parsed = StargazerConfigSchema.safeParse(userConfig);

  if (!parsed.success) {
    return err({
      code: 'BAD_REQUEST',
      message: `Invalid config: ${parsed.error.message}`,
    });
  }

  // Apply defaults and resolve
  return ok({
    minSeverity: parsed.data.minSeverity ?? 'low',
    maxIssues: parsed.data.maxIssues ?? 20,
    model: parsed.data.model ?? DEFAULT_MODEL,
    ignore: parsed.data.ignore ?? [],
    plugins: parsed.data.plugins ?? [],
  });
}
```

## Test

```bash
cd packages/core && pnpm test config.test.ts
```

Test with invalid config values.
