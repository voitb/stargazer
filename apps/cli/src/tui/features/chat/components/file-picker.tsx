/**
 * File Picker Component
 *
 * Displays files for the @ tagging feature.
 * Shows fuzzy-filtered file list with preview pane.
 */

import { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../../theme/index.js';
import { HintText, CodeText } from '../../../components/display/labels.js';
import {
  getAllFiles,
  fuzzySearchFiles,
  getFilePreview,
  isTextFile,
  type FileMatch,
} from '../../../utils/file-search.js';

export interface FilePickerProps {
  /** Project root path */
  projectPath: string;
  /** Current search term (text after @) */
  searchTerm: string;
  /** Called when file is selected */
  onSelect: (file: FileMatch) => void;
  /** Called when picker should close */
  onClose: () => void;
  /** Whether picker is active/focused */
  isActive?: boolean;
}

/**
 * File picker with fuzzy search and preview
 */
export function FilePicker({
  projectPath,
  searchTerm,
  onSelect,
  onClose,
  isActive = true,
}: FilePickerProps) {
  const { colors } = useTheme();
  const [files, setFiles] = useState<FileMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  // Load files on mount
  useEffect(() => {
    let cancelled = false;

    getAllFiles(projectPath)
      .then(result => {
        if (!cancelled) {
          // Filter to only files (not directories) for @ tagging
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
    return fuzzySearchFiles(files, searchTerm, 20);
  }, [files, searchTerm]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredFiles.length]);

  // Load preview for selected file
  useEffect(() => {
    const file = filteredFiles[selectedIndex];
    if (!file || !isTextFile(file.path)) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    getFilePreview(file.path, 8).then(content => {
      if (!cancelled) {
        setPreview(content);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [filteredFiles, selectedIndex]);

  useInput((input, key) => {
    if (!isActive) return;

    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(i => Math.max(0, i - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex(i => Math.min(filteredFiles.length - 1, i + 1));
      return;
    }

    if ((key.return || key.tab) && filteredFiles[selectedIndex]) {
      onSelect(filteredFiles[selectedIndex]);
      return;
    }
  }, { isActive });

  if (loading) {
    return (
      <Box
        borderStyle="round"
        borderColor={colors.border.subtle}
        paddingX={1}
        marginBottom={1}
      >
        <Text dimColor>Loading files...</Text>
      </Box>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <Box
        borderStyle="round"
        borderColor={colors.border.subtle}
        paddingX={1}
        marginBottom={1}
      >
        <Text dimColor>No files match "@{searchTerm}"</Text>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border.focus}
      marginBottom={1}
    >
      <Box paddingX={1}>
        <Text bold color={colors.text.secondary}>Files</Text>
        <Text dimColor> @{searchTerm}</Text>
      </Box>

      <Box flexDirection="row">
        {/* File list */}
        <Box flexDirection="column" width="50%" paddingX={1}>
          {filteredFiles.slice(0, 8).map((file, index) => {
            const isSelected = index === selectedIndex;
            return (
              <Box key={file.relativePath} gap={1}>
                <Text color={isSelected ? colors.brand.primary : undefined}>
                  {isSelected ? '▸' : ' '}
                </Text>
                <Text>📄</Text>
                <Text
                  bold={isSelected}
                  color={isSelected ? colors.brand.primary : undefined}
                  wrap="truncate"
                >
                  {file.relativePath}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Preview pane */}
        <Box
          flexDirection="column"
          width="50%"
          paddingX={1}
          borderStyle="single"
          borderLeft
          borderTop={false}
          borderBottom={false}
          borderRight={false}
          borderColor={colors.border.subtle}
        >
          {preview ? (
            <CodeText>{preview.slice(0, 300)}</CodeText>
          ) : (
            <Text dimColor>
              {filteredFiles[selectedIndex] && !isTextFile(filteredFiles[selectedIndex].path)
                ? '(Binary file)'
                : 'Select a file to preview'}
            </Text>
          )}
        </Box>
      </Box>

      <Box paddingX={1}>
        <HintText>↑↓ navigate • Enter/Tab select • ESC cancel</HintText>
      </Box>
    </Box>
  );
}
