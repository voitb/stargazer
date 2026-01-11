import { useState, useCallback } from 'react';
import { Box } from 'ink';
import { useTheme } from '../../../theme/index.js';
import { InlineInput } from '../../../components/forms/input-field.js';
import { TokenBadge } from '../../../components/display/usage-display.js';

interface ChatInputProps {
  onSubmit: (input: string) => void;
  placeholder?: string;
  /** Optional token count for display */
  tokenCount?: number;
  /** Optional token limit */
  tokenLimit?: number;
}

export function ChatInput({
  onSubmit,
  placeholder = 'Type a command...',
  tokenCount,
  tokenLimit,
}: ChatInputProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');

  const handleSubmit = useCallback((input: string) => {
    const trimmed = input.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setValue('');
    }
  }, [onSubmit]);

  return (
    <Box
      flexDirection="row"
      paddingX={1}
      borderStyle="round"
      borderTop
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderColor={colors.border.subtle}
      justifyContent="space-between"
    >
      <Box flexGrow={1}>
        <InlineInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder={placeholder}
        />
      </Box>
      {tokenCount !== undefined && tokenLimit !== undefined && (
        <Box marginLeft={2}>
          <TokenBadge current={tokenCount} limit={tokenLimit} />
        </Box>
      )}
    </Box>
  );
}
