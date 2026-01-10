---
id: task-160
title: Implement file tagging with @ symbol
status: pending
priority: high
labels:
  - cli
  - feature
  - chat
created: '2025-01-10'
order: 160
assignee: ai-agent
depends_on:
  - task-157
---

## Description

After typing `@`, allow users to tag files to include in the LLM context, similar to Claude Code and other AI coding assistants.

## Requirements

1. Typing `@` shows file picker
2. Fuzzy search for files in repository
3. Preview file contents before adding
4. Multiple file selection
5. Directory selection (include all files)
6. Syntax: `@src/index.ts` or `@components/`

## Implementation

### Step 1: Create file search utility

**File:** `packages/cli/src/tui/utils/file-search.ts` (create)

```typescript
import { readdir, stat, readFile } from 'node:fs/promises';
import { join, relative, basename, extname } from 'node:path';
import { existsSync } from 'node:fs';

const IGNORED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'coverage',
  '__pycache__',
  '.cache',
];

const IGNORED_EXTENSIONS = [
  '.lock',
  '.log',
  '.map',
  '.min.js',
  '.min.css',
];

export interface FileMatch {
  path: string;
  relativePath: string;
  name: string;
  isDirectory: boolean;
  size?: number;
  preview?: string;
}

/**
 * Recursively get all files in a directory
 */
export async function getAllFiles(
  rootPath: string,
  currentPath: string = rootPath,
  depth: number = 0,
  maxDepth: number = 5
): Promise<FileMatch[]> {
  if (depth > maxDepth) return [];

  const files: FileMatch[] = [];

  try {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      const relativePath = relative(rootPath, fullPath);

      // Skip ignored directories
      if (entry.isDirectory() && IGNORED_DIRS.includes(entry.name)) {
        continue;
      }

      // Skip hidden files/directories
      if (entry.name.startsWith('.')) {
        continue;
      }

      // Skip ignored extensions
      if (!entry.isDirectory() && IGNORED_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
        continue;
      }

      files.push({
        path: fullPath,
        relativePath,
        name: entry.name,
        isDirectory: entry.isDirectory(),
      });

      if (entry.isDirectory()) {
        const subFiles = await getAllFiles(rootPath, fullPath, depth + 1, maxDepth);
        files.push(...subFiles);
      }
    }
  } catch {
    // Permission denied or other error
  }

  return files;
}

/**
 * Fuzzy search files
 */
export function fuzzySearchFiles(
  files: FileMatch[],
  query: string
): FileMatch[] {
  if (!query) return files.slice(0, 20);

  const lower = query.toLowerCase();

  return files
    .filter(file => {
      const searchString = file.relativePath.toLowerCase();
      // Simple fuzzy match: all characters appear in order
      let queryIndex = 0;
      for (const char of searchString) {
        if (char === lower[queryIndex]) {
          queryIndex++;
          if (queryIndex === lower.length) return true;
        }
      }
      return false;
    })
    .sort((a, b) => {
      // Prioritize exact matches and shorter paths
      const aScore = a.relativePath.toLowerCase().indexOf(lower);
      const bScore = b.relativePath.toLowerCase().indexOf(lower);
      if (aScore !== bScore) return aScore === 0 ? -1 : bScore === 0 ? 1 : 0;
      return a.relativePath.length - b.relativePath.length;
    })
    .slice(0, 20);
}

/**
 * Get file preview (first N lines)
 */
export async function getFilePreview(
  filePath: string,
  maxLines: number = 10
): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, maxLines);
    return lines.join('\n') + (content.split('\n').length > maxLines ? '\n...' : '');
  } catch {
    return '(Unable to read file)';
  }
}

/**
 * Read file content for context
 */
export async function readFileForContext(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const stats = await stat(filePath);

    // Limit to ~50KB for context
    if (stats.size > 50000) {
      return content.slice(0, 50000) + '\n\n... (file truncated)';
    }

    return content;
  } catch (error) {
    throw new Error(`Could not read file: ${filePath}`);
  }
}
```

### Step 2: Create file picker component

**File:** `packages/cli/src/tui/features/chat/components/file-picker.tsx` (create)

```typescript
import { Box, Text, useInput } from 'ink';
import { useState, useEffect, useMemo } from 'react';
import {
  getAllFiles,
  fuzzySearchFiles,
  getFilePreview,
  type FileMatch,
} from '../../../utils/file-search.js';
import { useTheme, CodeText, HintText } from '../../../design-system/index.js';

interface FilePickerProps {
  projectPath: string;
  searchTerm: string;
  onSelect: (file: FileMatch) => void;
  onClose: () => void;
}

export function FilePicker({
  projectPath,
  searchTerm,
  onSelect,
  onClose,
}: FilePickerProps) {
  const { colors } = useTheme();
  const [files, setFiles] = useState<FileMatch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load files on mount
  useEffect(() => {
    getAllFiles(projectPath)
      .then(setFiles)
      .finally(() => setLoading(false));
  }, [projectPath]);

  // Filter files based on search
  const filteredFiles = useMemo(() => {
    return fuzzySearchFiles(files, searchTerm);
  }, [files, searchTerm]);

  // Load preview for selected file
  useEffect(() => {
    const file = filteredFiles[selectedIndex];
    if (file && !file.isDirectory) {
      getFilePreview(file.path).then(setPreview);
    } else {
      setPreview('');
    }
  }, [filteredFiles, selectedIndex]);

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow || (key.ctrl && input === 'p')) {
      setSelectedIndex(i => Math.max(0, i - 1));
      return;
    }

    if (key.downArrow || (key.ctrl && input === 'n')) {
      setSelectedIndex(i => Math.min(filteredFiles.length - 1, i + 1));
      return;
    }

    if (key.return) {
      const file = filteredFiles[selectedIndex];
      if (file) {
        onSelect(file);
      }
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
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border.subtle}
      marginBottom={1}
      maxHeight={15}
    >
      <Box paddingX={1} paddingY={0}>
        <Text bold>Files</Text>
        <Text dimColor> (@{searchTerm})</Text>
      </Box>

      <Box flexDirection="row">
        {/* File list */}
        <Box flexDirection="column" width="50%" paddingX={1}>
          {filteredFiles.length === 0 ? (
            <Text dimColor>No files match "{searchTerm}"</Text>
          ) : (
            filteredFiles.slice(0, 8).map((file, index) => (
              <Box key={file.relativePath} gap={1}>
                <Text color={index === selectedIndex ? 'cyan' : undefined}>
                  {index === selectedIndex ? '▶' : ' '}
                </Text>
                <Text color={file.isDirectory ? 'yellow' : undefined}>
                  {file.isDirectory ? '📁' : '📄'}
                </Text>
                <Text bold={index === selectedIndex}>
                  {file.relativePath}
                </Text>
              </Box>
            ))
          )}
        </Box>

        {/* Preview pane */}
        <Box
          flexDirection="column"
          width="50%"
          borderStyle="single"
          borderLeft
          borderTop={false}
          borderBottom={false}
          borderRight={false}
          borderColor={colors.border.subtle}
          paddingX={1}
        >
          {preview ? (
            <CodeText>{preview.slice(0, 500)}</CodeText>
          ) : (
            <Text dimColor>Select a file to preview</Text>
          )}
        </Box>
      </Box>

      <Box paddingX={1}>
        <HintText>↑↓ navigate • Enter select • ESC close</HintText>
      </Box>
    </Box>
  );
}
```

### Step 3: Update chat input to handle @ mentions

**File:** `packages/cli/src/tui/features/chat/components/enhanced-chat-input.tsx`

Update to show file picker when typing `@`:

```typescript
import { useState, useCallback, useMemo } from 'react';
import { Box } from 'ink';
import { FilePicker } from './file-picker.js';
import { readFileForContext, type FileMatch } from '../../../utils/file-search.js';

interface EnhancedChatInputProps {
  // ... existing props
  projectPath: string;
}

export function EnhancedChatInput({
  projectPath,
  // ... other props
}: EnhancedChatInputProps) {
  const [value, setValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileMatch[]>([]);

  // Detect @ mention
  const atMention = useMemo(() => {
    const match = value.match(/@(\S*)$/);
    return match ? match[1] : null;
  }, [value]);

  const shouldShowFilePicker = atMention !== null;

  const handleFileSelect = useCallback(async (file: FileMatch) => {
    // Remove the @ mention from input
    const newValue = value.replace(/@\S*$/, '');
    setValue(newValue);

    // Add file to attached files
    setAttachedFiles(prev => [...prev, file]);
  }, [value]);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    // Build message with file context
    let messageContent = trimmed;

    if (attachedFiles.length > 0) {
      const fileContexts = await Promise.all(
        attachedFiles.map(async (file) => {
          const content = await readFileForContext(file.path);
          return `\n\n--- File: ${file.relativePath} ---\n\`\`\`\n${content}\n\`\`\``;
        })
      );

      messageContent = trimmed + fileContexts.join('');
    }

    onSubmit(messageContent);
    setValue('');
    setAttachedFiles([]);
  }, [value, attachedFiles, onSubmit]);

  return (
    <Box flexDirection="column">
      {/* Show attached files */}
      {attachedFiles.length > 0 && (
        <Box flexDirection="row" gap={1} paddingX={1} marginBottom={1}>
          {attachedFiles.map((file, i) => (
            <Box key={i} paddingX={1} borderStyle="round">
              <Text>📎 {file.relativePath}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* File picker */}
      {shouldShowFilePicker && (
        <FilePicker
          projectPath={projectPath}
          searchTerm={atMention || ''}
          onSelect={handleFileSelect}
          onClose={() => setValue(value.replace(/@\S*$/, ''))}
        />
      )}

      {/* Input field */}
      {/* ... rest of input component ... */}
    </Box>
  );
}
```

## Acceptance Criteria

- [ ] Typing `@` shows file picker
- [ ] Fuzzy search filters files
- [ ] Arrow keys navigate file list
- [ ] File preview shows on selection
- [ ] Enter adds file to context
- [ ] Multiple files can be attached
- [ ] Attached files show as badges above input
- [ ] File content is included in message to LLM
- [ ] Directories can be selected
- [ ] Ignored directories (node_modules, .git) are excluded

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit

# Manual test:
# 1. Start CLI, go to chat
# 2. Type @ - verify file picker appears
# 3. Type @src - verify files filter
# 4. Navigate with arrows
# 5. Press Enter to select file
# 6. Verify file appears as attachment
# 7. Send message, verify file content is included
```

## Files Changed

- CREATE: `packages/cli/src/tui/utils/file-search.ts`
- CREATE: `packages/cli/src/tui/features/chat/components/file-picker.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/components/enhanced-chat-input.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/components/index.ts`
- UPDATE: `packages/cli/src/tui/utils/index.ts`
