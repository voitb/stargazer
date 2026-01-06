---
id: task-034
title: Create ConventionSchema
status: done
priority: medium
labels:
  - core
  - conventions
created: '2026-01-01'
order: 175
assignee: voitb
---
## Description

Create Zod schemas for convention patterns for Gemini structured output.

## Acceptance Criteria

- [x] Create `packages/core/src/conventions/schemas.ts`
- [x] Define ConventionPatternSchema
- [x] Define ProjectConventionsSchema
- [x] Export types from schemas

## Implementation

**File**: `packages/core/src/conventions/schemas.ts`

```typescript
import * as z from 'zod/v4';

export const ConventionPatternSchema = z.object({
  name: z.string().describe('Pattern name like "error-handling" or "naming-convention"'),
  description: z.string().describe('What this pattern enforces and why'),
  examples: z.array(z.string()).describe('Code snippets showing the pattern in use'),
}).describe('A coding convention pattern found in the codebase');

export const ProjectConventionsSchema = z.object({
  patterns: z.array(ConventionPatternSchema).describe('All detected coding patterns'),
  discoveredAt: z.string().describe('ISO 8601 timestamp of discovery'),
}).describe('Complete set of project conventions');

// Inferred types from schemas
export type ConventionPattern = z.infer<typeof ConventionPatternSchema>;
export type ProjectConventions = z.infer<typeof ProjectConventionsSchema>;

// JSON Schema for Gemini (OpenAPI 3.0 target)
export const ProjectConventionsJSONSchema = z.toJSONSchema(ProjectConventionsSchema, {
  target: 'openapi-3.0',
});
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors. Schema can generate JSON Schema.
