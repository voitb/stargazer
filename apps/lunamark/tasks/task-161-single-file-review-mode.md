---
id: task-161
title: Implement single file review mode
status: done
priority: high
labels:
  - cli
  - feature
  - review
created: '2025-01-10'
order: 161
assignee: ai-agent
depends_on:
  - task-160
---

## Description

Allow users to review only specific files instead of all staged/unstaged changes. This provides more focused, targeted code reviews.

## Requirements

1. Select single file for review
2. Select multiple specific files
3. Review only changed lines (like PR review)
4. File picker integration from task-160

## Implementation

### Step 1: Update review types

**File:** `packages/cli/src/tui/features/review/types.ts` (update)

```typescript
export type ReviewType = 'staged' | 'unstaged' | 'files';

export interface ReviewOptions {
  type: ReviewType;
  files?: string[]; // Specific files to review
  onlyChanges?: boolean; // Only review changed lines
}
```

### Step 2: Create file selection screen

**File:** `packages/cli/src/tui/features/review/file-select-screen.tsx` (create)

```typescript
import { Box, Text, useInput } from 'ink';
import { useState, useEffect } from 'react';
import { useTheme, ScreenTitle, HintText, Badge } from '../../design-system/index.js';
import { getAllFiles, fuzzySearchFiles, type FileMatch } from '../../utils/file-search.js';
import { useAppContext } from '../../state/app-context.js';

export function FileSelectScreen() {
  const { colors } = useTheme();
  const { projectPath, navigate, startReview } = useAppContext();

  const [files, setFiles] = useState<FileMatch[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [cursorIndex, setCursorIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Load files
  useEffect(() => {
    getAllFiles(projectPath)
      .then(files => files.filter(f => !f.isDirectory))
      .then(setFiles)
      .finally(() => setLoading(false));
  }, [projectPath]);

  // Filter files
  const filteredFiles = searchTerm
    ? fuzzySearchFiles(files, searchTerm)
    : files.slice(0, 20);

  useInput((input, key) => {
    if (key.escape) {
      navigate('home');
      return;
    }

    if (key.upArrow || input === 'k') {
      setCursorIndex(i => Math.max(0, i - 1));
      return;
    }

    if (key.downArrow || input === 'j') {
      setCursorIndex(i => Math.min(filteredFiles.length - 1, i + 1));
      return;
    }

    // Space to toggle selection
    if (input === ' ') {
      const file = filteredFiles[cursorIndex];
      if (file) {
        setSelectedFiles(prev => {
          const next = new Set(prev);
          if (next.has(file.relativePath)) {
            next.delete(file.relativePath);
          } else {
            next.add(file.relativePath);
          }
          return next;
        });
      }
      return;
    }

    // Enter to start review
    if (key.return && selectedFiles.size > 0) {
      startReview({
        type: 'files',
        files: Array.from(selectedFiles),
      });
      navigate('loading');
      return;
    }

    // Type to search
    if (input && input.length === 1 && !key.ctrl && !key.meta) {
      setSearchTerm(prev => prev + input);
      setCursorIndex(0);
      return;
    }

    if (key.backspace || key.delete) {
      setSearchTerm(prev => prev.slice(0, -1));
      setCursorIndex(0);
      return;
    }
  });

  if (loading) {
    return (
      <Box padding={1}>
        <Text>Loading files...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <ScreenTitle>Select Files to Review</ScreenTitle>

      {/* Search bar */}
      <Box marginY={1}>
        <Text>Search: </Text>
        <Text color="cyan">{searchTerm || '(type to filter)'}</Text>
      </Box>

      {/* Selected count */}
      <Box marginBottom={1}>
        <Badge variant="brand">{selectedFiles.size} files selected</Badge>
      </Box>

      {/* File list */}
      <Box flexDirection="column" maxHeight={15}>
        {filteredFiles.map((file, index) => {
          const isSelected = selectedFiles.has(file.relativePath);
          const isCursor = index === cursorIndex;

          return (
            <Box key={file.relativePath} gap={1}>
              <Text color={isCursor ? 'cyan' : undefined}>
                {isCursor ? '▶' : ' '}
              </Text>
              <Text color={isSelected ? 'green' : undefined}>
                {isSelected ? '☑' : '☐'}
              </Text>
              <Text bold={isCursor}>{file.relativePath}</Text>
            </Box>
          );
        })}
      </Box>

      {/* Hints */}
      <Box marginTop={2}>
        <HintText>
          ↑↓ navigate • Space toggle • Enter review selected • ESC back
        </HintText>
      </Box>
    </Box>
  );
}
```

### Step 3: Add to menu and screen router

**File:** `packages/cli/src/tui/components/navigation/main-menu.tsx`

Add new menu item:

```typescript
const MENU_ITEMS = [
  { value: 'review-staged', label: 'Review Staged Changes' },
  { value: 'review-unstaged', label: 'Review Unstaged Changes' },
  { value: 'review-files', label: 'Review Specific Files' }, // NEW
  // ... rest of items
];
```

**File:** `packages/cli/src/tui/screens/screen-router.tsx`

Add new screen:

```typescript
import { FileSelectScreen } from '../features/review/file-select-screen.js';

// In switch statement:
case 'fileSelect':
  return <FileSelectScreen />;
```

**File:** `packages/cli/src/tui/app.tsx`

Handle menu selection:

```typescript
case 'review-files':
  navigate('fileSelect');
  break;
```

### Step 4: Update review hook for file-specific reviews

**File:** `packages/cli/src/tui/hooks/use-app-review.ts`

```typescript
const reviewFiles = useCallback(async (filePaths: string[]) => {
  setIsReviewing(true);
  setPhase('analyzing');
  setError(null);

  try {
    // Read file contents
    const files = await Promise.all(
      filePaths.map(async (filePath) => {
        const content = await readFile(join(projectPath, filePath), 'utf-8');
        return { path: filePath, content };
      })
    );

    // Generate review
    const result = await reviewCode({
      files,
      projectPath,
      model: currentModel,
    });

    setResult(result);
    setPhase('complete');
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Review failed');
    setPhase('error');
  } finally {
    setIsReviewing(false);
  }
}, [projectPath, currentModel]);

return {
  // ... existing returns
  reviewFiles,
};
```

## Acceptance Criteria

- [ ] New menu option "Review Specific Files"
- [ ] File selection screen with multi-select
- [ ] Search/filter files by typing
- [ ] Space bar toggles file selection
- [ ] Enter starts review with selected files
- [ ] Review results show per-file issues
- [ ] Can review files not in git staging

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit

# Manual test:
# 1. Start CLI
# 2. Select "Review Specific Files"
# 3. Navigate file list
# 4. Select multiple files with Space
# 5. Press Enter to start review
# 6. Verify review runs on selected files only
```

## Files Changed

- UPDATE: `packages/cli/src/tui/features/review/types.ts`
- CREATE: `packages/cli/src/tui/features/review/file-select-screen.tsx`
- UPDATE: `packages/cli/src/tui/features/review/index.ts`
- UPDATE: `packages/cli/src/tui/components/navigation/main-menu.tsx`
- UPDATE: `packages/cli/src/tui/screens/screen-router.tsx`
- UPDATE: `packages/cli/src/tui/state/navigation-context.tsx` (add 'fileSelect' screen)
- UPDATE: `packages/cli/src/tui/app.tsx`
- UPDATE: `packages/cli/src/tui/hooks/use-app-review.ts`
