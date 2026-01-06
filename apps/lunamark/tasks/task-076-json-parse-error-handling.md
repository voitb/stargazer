---
id: task-076
title: Add JSON parse error handling in Gemini client
status: done
priority: critical
labels:
  - core
  - gemini
created: '2026-01-06'
order: 760
assignee: voitb
---
## Description

Add proper error handling for JSON parsing in the Gemini client to handle malformed LLM responses.

## Issue Details

**File**: `/packages/core/src/gemini/client.ts:45`
**Confidence**: 91%
**Category**: Reliability

The current code:
```typescript
const parsed = schema.safeParse(JSON.parse(text));
```

If Gemini returns malformed JSON (which can happen with LLMs), `JSON.parse()` will throw an uncaught exception, bypassing the structured error handling.

## Acceptance Criteria

- [x] Wrap `JSON.parse()` in try-catch
- [x] Return structured error with helpful message
- [x] Include raw response in error for debugging
- [x] Add test for malformed JSON handling

## Implementation

**File**: `packages/core/src/gemini/client.ts`

```typescript
// Parse JSON safely
let jsonData: unknown;
try {
  jsonData = JSON.parse(text);
} catch (parseError) {
  return err({
    code: 'SCHEMA_VALIDATION',
    message: `Invalid JSON from Gemini: ${parseError instanceof Error ? parseError.message : 'parse error'}`,
    cause: parseError,
  });
}

const parsed = schema.safeParse(jsonData);
if (!parsed.success) {
  return err({
    code: 'SCHEMA_VALIDATION',
    message: parsed.error.message,
  });
}
```

## Test

```bash
cd packages/core && pnpm test client.test.ts
```

Add test case with malformed JSON response.
