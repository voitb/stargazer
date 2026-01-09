/**
 * Stargazer CLI Design System - InputField Component
 *
 * Styled text input with star-themed label and border.
 */

import { Box, Text } from 'ink';
import { TextInput } from '@inkjs/ui';
import { useTheme } from '../primitives/theme-provider.js';
import { STAR_ICONS } from '../palettes.js';

export interface InputFieldProps {
  /** Field label */
  label: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Mask input (for passwords) */
  isPassword?: boolean;
  /** Show star icon in label (default: true) */
  showIcon?: boolean;
  /** Focus state */
  isFocused?: boolean;
}

/**
 * InputField Component
 *
 * Wraps @inkjs/ui TextInput with design system styling.
 *
 * @example
 * ```tsx
 * <InputField
 *   label="API Key"
 *   value={apiKey}
 *   onChange={setApiKey}
 *   isPassword
 * />
 * ```
 */
export function InputField({
  label,
  value,
  onChange,
  placeholder,
  isPassword = false,
  showIcon = true,
  isFocused = true,
}: InputFieldProps) {
  const { colors } = useTheme();

  const borderColor = isFocused ? colors.border.focus : colors.border.subtle;
  const labelIcon = showIcon ? `${STAR_ICONS.outline} ` : '';

  return (
    <Box flexDirection="column" gap={0}>
      <Text color={colors.text.secondary}>
        {labelIcon}{label}
      </Text>
      <Box
        borderStyle="round"
        borderColor={borderColor}
        paddingX={1}
      >
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          mask={isPassword ? '*' : undefined}
        />
      </Box>
    </Box>
  );
}

/**
 * Inline input - no border, just underline style
 */
export function InlineInput({
  value,
  onChange,
  placeholder,
}: Pick<InputFieldProps, 'value' | 'onChange' | 'placeholder'>) {
  const { colors } = useTheme();

  return (
    <Box>
      <Text color={colors.text.secondary}>{STAR_ICONS.outline} </Text>
      <TextInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </Box>
  );
}
