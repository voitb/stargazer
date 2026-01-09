import { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { TextInput } from '@inkjs/ui';

interface ChatInputProps {
  onSubmit: (input: string) => void;
  placeholder?: string;
}

export function ChatInput({ onSubmit, placeholder = 'Type a command...' }: ChatInputProps) {
  const [key, setKey] = useState(0);

  const handleSubmit = useCallback((input: string) => {
    const trimmed = input.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setKey((k) => k + 1);
    }
  }, [onSubmit]);

  return (
    <Box flexDirection="row" paddingX={1} borderStyle="single" borderTop>
      <Text color="cyan" bold>
        {'> '}
      </Text>
      <TextInput
        key={key}
        onSubmit={handleSubmit}
        placeholder={placeholder}
      />
    </Box>
  );
}
