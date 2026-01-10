/**
 * File Selection Screen
 *
 * Allows users to select specific files for code review.
 * Multi-select with fuzzy search and keyboard navigation.
 */

import { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import {
  useTheme,
  ScreenTitle,
  HintText,
  Badge,
} from '../../design-system/index.js';
import { useAppContext } from '../../state/app-context.js';
import {
  getAllFiles,
  fuzzySearchFiles,
  type FileMatch,
} from '../../utils/file-search.js';

/**
 * File selection screen for targeted code reviews
 */
export function FileSelectScreen() {
  const { colors } = useTheme();
  const { projectPath, navigate } = useAppContext();

  const [files, setFiles] = useState<FileMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [cursorIndex, setCursorIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Load files on mount
  useEffect(() => {
    let cancelled = false;

    getAllFiles(projectPath)
      .then(result => {
        if (!cancelled) {
          // Filter to only files (not directories)
          setFiles(result.filter(f => !f.isDirectory));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectPath]);

  // Filter files based on search
  const filteredFiles = useMemo(() => {
    return fuzzySearchFiles(files, searchTerm, 50);
  }, [files, searchTerm]);

  // Reset cursor when search changes
  useEffect(() => {
    setCursorIndex(0);
  }, [searchTerm]);

  useInput((input, key) => {
    // Escape to go back
    if (key.escape) {
      navigate('home');
      return;
    }

    // Navigation
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

    // Enter to start review (if files selected)
    if (key.return) {
      if (selectedFiles.size > 0) {
        // Store selected files and navigate to review
        // For now, show confirmation message
        navigate('home');
      }
      return;
    }

    // Backspace for search
    if (key.backspace || key.delete) {
      setSearchTerm(prev => prev.slice(0, -1));
      return;
    }

    // Type to search
    if (input && input.length === 1 && !key.ctrl && !key.meta) {
      setSearchTerm(prev => prev + input);
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
        <Text color={colors.brand.primary}>
          {searchTerm || <Text dimColor>(type to filter)</Text>}
        </Text>
      </Box>

      {/* Selected count */}
      <Box marginBottom={1} gap={2}>
        <Badge variant="brand">
          {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
        </Badge>
        {selectedFiles.size > 0 && (
          <Text dimColor>Press Enter to review</Text>
        )}
      </Box>

      {/* File list */}
      <Box flexDirection="column">
        {filteredFiles.length === 0 ? (
          <Text dimColor>
            {searchTerm
              ? `No files match "${searchTerm}"`
              : 'No files found in project'}
          </Text>
        ) : (
          filteredFiles.slice(0, 15).map((file, index) => {
            const isSelected = selectedFiles.has(file.relativePath);
            const isCursor = index === cursorIndex;

            return (
              <Box key={file.relativePath} gap={1}>
                <Text color={isCursor ? colors.brand.primary : undefined}>
                  {isCursor ? '▸' : ' '}
                </Text>
                <Text color={isSelected ? 'green' : undefined}>
                  {isSelected ? '☑' : '☐'}
                </Text>
                <Text
                  bold={isCursor}
                  color={isCursor ? colors.brand.primary : undefined}
                  wrap="truncate"
                >
                  {file.relativePath}
                </Text>
              </Box>
            );
          })
        )}
      </Box>

      {/* Show selected files summary */}
      {selectedFiles.size > 0 && selectedFiles.size <= 5 && (
        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>Selected:</Text>
          {Array.from(selectedFiles).map(path => (
            <Text key={path} dimColor>  • {path}</Text>
          ))}
        </Box>
      )}

      {/* Hints */}
      <Box marginTop={2}>
        <HintText>
          ↑↓/jk navigate • Space toggle • Enter review • ESC back
        </HintText>
      </Box>
    </Box>
  );
}
