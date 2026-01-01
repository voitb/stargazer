---
id: task-036
title: Create buildDiscoveryPrompt
status: todo
priority: medium
labels:
  - core
  - conventions
created: '2026-01-01'
order: 360
---
## Description

Create the prompt builder for convention discovery.

## Acceptance Criteria

- [ ] Create `packages/core/src/conventions/prompts.ts`
- [ ] Implement `buildDiscoveryPrompt()` function
- [ ] Include code samples in prompt
- [ ] Clear instructions for pattern detection

## Implementation

**File**: `packages/core/src/conventions/prompts.ts`

```typescript
import type { FileContent } from './files';

export function buildDiscoveryPrompt(files: FileContent[]): string {
  const samplesText = files
    .map((file) => `File: ${file.path}\n\`\`\`typescript\n${file.content}\n\`\`\``)
    .join('\n\n');

  return `You are analyzing a codebase to discover coding conventions and patterns.

Examine the following code samples and identify the key coding conventions used in this project.

Look for patterns in:
- **Error handling** - How are errors handled? Exceptions vs Result types? Error messages format?
- **Naming conventions** - Function names, variable names, file naming patterns
- **Code organization** - Import ordering, export patterns, module structure
- **TypeScript usage** - Strict mode patterns, type assertions, generics usage
- **Function patterns** - Arrow functions vs declarations, async patterns
- **Testing patterns** - Test structure, naming, assertion styles

${samplesText}

Identify 3-7 key patterns that are consistently used across the codebase.
For each pattern, provide:
1. A short name (like "result-type-errors" or "factory-functions")
2. A clear description of what the pattern is
3. 1-2 code examples from the files showing the pattern

Set discoveredAt to the current ISO timestamp.`;
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
