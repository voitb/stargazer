---
id: task-084
title: Add conventionRef to terminal output
status: done
priority: medium
labels:
  - cli
  - output
created: '2026-01-06'
order: 840
assignee: voitb
---
## Description

Add convention reference display to terminal output for feature parity with markdown output.

## Issue Details

**File**: `/packages/cli/src/output/terminal.ts:42-56`
**Confidence**: 81%
**Category**: Feature Parity

The markdown formatter outputs `conventionRef` (line 72-75 in `markdown.ts`), but the terminal formatter does not. This means terminal users miss important context about which convention was violated.

## Acceptance Criteria

- [x] Add `conventionRef` display to terminal formatter
- [x] Use consistent styling with suggestion display
- [x] Only show when `conventionRef` is present

## Implementation

**File**: `packages/cli/src/output/terminal.ts`

```typescript
function formatIssue(issue: Issue): string {
  const severityColor = SEVERITY_COLORS[issue.severity];
  const location = chalk.dim(`${issue.file}:${issue.line}`);

  let output = `  ${severityColor('●')} ${location}\n`;
  output += `    ${issue.message}\n`;

  if (issue.suggestion) {
    output += chalk.dim(`    💡 ${issue.suggestion}\n`);
  }

  // NEW: Add convention reference
  if (issue.conventionRef) {
    output += chalk.dim(`    📋 Convention: ${issue.conventionRef}\n`);
  }

  return output;
}
```

## Test

```bash
cd packages/cli && pnpm build
GEMINI_API_KEY=xxx pnpm stargazer review --format terminal
```

Should display convention references when present.

## Example Output

```
● src/utils.ts:42
  Variable name 'x' is not descriptive
  💡 Use a more descriptive name like 'userCount' or 'itemIndex'
  📋 Convention: naming.variables
```
