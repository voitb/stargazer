---
id: task-162
title: Show exact code changes from review
status: pending
priority: high
labels:
  - cli
  - feature
  - review
created: '2025-01-10'
order: 162
assignee: ai-agent
depends_on: []
---

## Description

Display the EXACT changes needed to fix issues found in code review. Show unified diff format with before/after, allowing users to apply changes with one click.

## Requirements

1. Unified diff format for each issue
2. Line-by-line changes with line numbers
3. Before/after preview
4. One-click apply changes
5. Copy patch to clipboard
6. Generate git patch file

## Implementation

### Step 1: Update review result types

**File:** `packages/cli/src/tui/features/review/types.ts`

```typescript
export interface CodeFix {
  /** File path relative to project root */
  filePath: string;
  /** Starting line number (1-based) */
  startLine: number;
  /** Ending line number (1-based) */
  endLine: number;
  /** Original code */
  originalCode: string;
  /** Fixed code */
  fixedCode: string;
  /** Description of the fix */
  description: string;
}

export interface ReviewIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  file: string;
  line: number;
  column?: number;
  category: string;
  /** Suggested fix with exact code changes */
  fix?: CodeFix;
}

export interface ReviewResult {
  issues: ReviewIssue[];
  summary: string;
  score?: number;
}
```

### Step 2: Create diff display component

**File:** `packages/cli/src/tui/features/review/components/diff-view.tsx` (create)

```typescript
import { Box, Text } from 'ink';
import { useTheme, CodeText, HintText, Badge } from '../../../design-system/index.js';
import { type CodeFix } from '../types.js';

interface DiffViewProps {
  fix: CodeFix;
  showLineNumbers?: boolean;
}

export function DiffView({ fix, showLineNumbers = true }: DiffViewProps) {
  const { colors } = useTheme();

  // Generate unified diff
  const originalLines = fix.originalCode.split('\n');
  const fixedLines = fix.fixedCode.split('\n');

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.border.subtle}>
      {/* Header */}
      <Box paddingX={1} borderStyle="single" borderBottom borderTop={false} borderLeft={false} borderRight={false}>
        <Text bold>{fix.filePath}</Text>
        <Text dimColor> lines {fix.startLine}-{fix.endLine}</Text>
      </Box>

      {/* Description */}
      <Box paddingX={1} paddingY={0}>
        <Text>{fix.description}</Text>
      </Box>

      {/* Diff content */}
      <Box flexDirection="column" paddingX={1}>
        {/* Removed lines */}
        {originalLines.map((line, i) => (
          <Box key={`old-${i}`}>
            {showLineNumbers && (
              <Text dimColor>{String(fix.startLine + i).padStart(4)} </Text>
            )}
            <Text backgroundColor="#4a1515" color="#ff6b6b">
              - {line}
            </Text>
          </Box>
        ))}

        {/* Added lines */}
        {fixedLines.map((line, i) => (
          <Box key={`new-${i}`}>
            {showLineNumbers && (
              <Text dimColor>{String(fix.startLine + i).padStart(4)} </Text>
            )}
            <Text backgroundColor="#1a4a1a" color="#6bff6b">
              + {line}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
```

### Step 3: Create fix application utility

**File:** `packages/cli/src/tui/utils/apply-fix.ts` (create)

```typescript
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type CodeFix } from '../features/review/types.js';

/**
 * Apply a code fix to a file
 */
export async function applyFix(
  projectPath: string,
  fix: CodeFix
): Promise<void> {
  const filePath = join(projectPath, fix.filePath);
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  // Replace lines
  const newLines = [
    ...lines.slice(0, fix.startLine - 1),
    ...fix.fixedCode.split('\n'),
    ...lines.slice(fix.endLine),
  ];

  await writeFile(filePath, newLines.join('\n'), 'utf-8');
}

/**
 * Generate unified diff patch
 */
export function generatePatch(fix: CodeFix): string {
  const originalLines = fix.originalCode.split('\n');
  const fixedLines = fix.fixedCode.split('\n');

  let patch = `--- a/${fix.filePath}\n`;
  patch += `+++ b/${fix.filePath}\n`;
  patch += `@@ -${fix.startLine},${originalLines.length} +${fix.startLine},${fixedLines.length} @@\n`;

  for (const line of originalLines) {
    patch += `-${line}\n`;
  }
  for (const line of fixedLines) {
    patch += `+${line}\n`;
  }

  return patch;
}

/**
 * Copy text to clipboard (cross-platform)
 */
export async function copyToClipboard(text: string): Promise<void> {
  const { exec } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execAsync = promisify(exec);

  const platform = process.platform;

  if (platform === 'darwin') {
    await execAsync('pbcopy', { input: text });
  } else if (platform === 'linux') {
    await execAsync('xclip -selection clipboard', { input: text });
  } else if (platform === 'win32') {
    await execAsync('clip', { input: text });
  }
}
```

### Step 4: Create issue detail screen with fix

**File:** `packages/cli/src/tui/features/review/components/issue-detail.tsx` (create)

```typescript
import { Box, Text, useInput } from 'ink';
import { useState, useCallback } from 'react';
import { useTheme, ScreenTitle, Badge, HintText } from '../../../design-system/index.js';
import { DiffView } from './diff-view.js';
import { applyFix, generatePatch, copyToClipboard } from '../../../utils/apply-fix.js';
import { type ReviewIssue } from '../types.js';

interface IssueDetailProps {
  issue: ReviewIssue;
  projectPath: string;
  onBack: () => void;
  onApplied: () => void;
}

export function IssueDetail({
  issue,
  projectPath,
  onBack,
  onApplied,
}: IssueDetailProps) {
  const { colors } = useTheme();
  const [status, setStatus] = useState<'idle' | 'applying' | 'applied' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleApply = useCallback(async () => {
    if (!issue.fix) return;

    setStatus('applying');
    try {
      await applyFix(projectPath, issue.fix);
      setStatus('applied');
      onApplied();
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Failed to apply fix');
    }
  }, [issue.fix, projectPath, onApplied]);

  const handleCopy = useCallback(async () => {
    if (!issue.fix) return;
    const patch = generatePatch(issue.fix);
    await copyToClipboard(patch);
  }, [issue.fix]);

  useInput((input, key) => {
    if (key.escape || input === 'b') {
      onBack();
      return;
    }

    if (input === 'a' && issue.fix && status === 'idle') {
      handleApply();
      return;
    }

    if (input === 'c' && issue.fix) {
      handleCopy();
      return;
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Badge variant={
          issue.severity === 'critical' ? 'error' :
          issue.severity === 'high' ? 'warning' :
          'info'
        }>
          {issue.severity.toUpperCase()}
        </Badge>
        <Text> </Text>
        <Text bold>{issue.category}</Text>
      </Box>

      {/* Issue message */}
      <Box marginBottom={1}>
        <Text>{issue.message}</Text>
      </Box>

      {/* Location */}
      <Box marginBottom={1}>
        <Text dimColor>Location: </Text>
        <Text color="cyan">{issue.file}:{issue.line}</Text>
      </Box>

      {/* Fix diff */}
      {issue.fix ? (
        <Box flexDirection="column">
          <Text bold marginBottom={1}>Suggested Fix:</Text>
          <DiffView fix={issue.fix} />

          {/* Status */}
          {status === 'applied' && (
            <Box marginTop={1}>
              <Badge variant="success">Fix applied!</Badge>
            </Box>
          )}
          {status === 'error' && (
            <Box marginTop={1}>
              <Badge variant="error">Error: {error}</Badge>
            </Box>
          )}
        </Box>
      ) : (
        <Box marginTop={1}>
          <Text dimColor>No automatic fix available for this issue.</Text>
        </Box>
      )}

      {/* Actions */}
      <Box marginTop={2}>
        <HintText>
          {issue.fix && status === 'idle' ? 'A apply fix • ' : ''}
          {issue.fix ? 'C copy patch • ' : ''}
          ESC back
        </HintText>
      </Box>
    </Box>
  );
}
```

### Step 5: Update review view to show fixes

**File:** `packages/cli/src/tui/features/review/components/review-view.tsx`

Update to show fix indicator and allow drilling into issues:

```typescript
// Add to issue list rendering:
{issue.fix && (
  <Badge variant="success" showIcon={false}>FIX</Badge>
)}

// Add Enter to view detail:
useInput((input, key) => {
  if (key.return) {
    const issue = issues[selectedIndex];
    if (issue) {
      setSelectedIssue(issue);
    }
  }
});
```

## Acceptance Criteria

- [ ] Review results show which issues have automatic fixes
- [ ] Pressing Enter on issue shows diff view
- [ ] Diff shows original vs fixed code with line numbers
- [ ] "A" key applies the fix to the file
- [ ] "C" key copies patch to clipboard
- [ ] Status shows after applying (success/error)
- [ ] Back button returns to issue list

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit

# Manual test:
# 1. Run a code review
# 2. Select an issue with a fix
# 3. View the diff
# 4. Press A to apply
# 5. Verify file is modified
# 6. Press C to copy patch
# 7. Verify patch is in clipboard
```

## Files Changed

- UPDATE: `packages/cli/src/tui/features/review/types.ts`
- CREATE: `packages/cli/src/tui/features/review/components/diff-view.tsx`
- CREATE: `packages/cli/src/tui/features/review/components/issue-detail.tsx`
- CREATE: `packages/cli/src/tui/utils/apply-fix.ts`
- UPDATE: `packages/cli/src/tui/features/review/components/review-view.tsx`
- UPDATE: `packages/cli/src/tui/features/review/components/index.ts`
- UPDATE: `packages/cli/src/tui/utils/index.ts`
