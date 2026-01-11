/**
 * Stargazer CLI Design System - InputField Component
 *
 * Styled text input with star-themed label and border.
 * Uses a custom controlled input implementation for full state control.
 */

import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../theme/index.js';
import { STAR_ICONS } from '../../theme/palettes.js';

/**
 * Internal controlled text input component
 *
 * Built with useInput hook for full state control.
 * Supports masking for password fields.
 */
function ControlledTextInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  mask,
  isFocused = true,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: string;
  isFocused?: boolean;
}) {
  const { colors } = useTheme();

  useInput(
    (input, key) => {
      // Handle submit (Enter)
      if (key.return && onSubmit) {
        onSubmit(value);
        return;
      }

      // Handle backspace/delete
      if (key.backspace || key.delete) {
        onChange(value.slice(0, -1));
        return;
      }

      // Only accept printable characters (not control keys)
      if (input && !key.ctrl && !key.meta) {
        onChange(value + input);
      }
    },
    { isActive: isFocused }
  );

  const displayValue = mask ? mask.repeat(value.length) : value;
  const showPlaceholder = !value && placeholder;

  return (
    <Text color={showPlaceholder ? colors.text.muted : colors.text.primary}>
      {showPlaceholder ? placeholder : displayValue}
      {isFocused && <Text inverse> </Text>}
    </Text>
  );
}

export interface InputFieldProps {
  /** Field label */
  label: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Submit handler */
  onSubmit?: (value: string) => void;
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
 * Wraps ControlledTextInput with design system styling.
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
  onSubmit,
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
        <ControlledTextInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={placeholder}
          mask={isPassword ? '*' : undefined}
          isFocused={isFocused}
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
  onSubmit,
  placeholder,
  isFocused = true,
}: Pick<InputFieldProps, 'value' | 'onChange' | 'onSubmit' | 'placeholder'> & { isFocused?: boolean }) {
  const { colors } = useTheme();

  return (
    <Box>
      <Text color={colors.text.secondary}>{STAR_ICONS.outline} </Text>
      <ControlledTextInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
        isFocused={isFocused}
      />
    </Box>
  );
}
