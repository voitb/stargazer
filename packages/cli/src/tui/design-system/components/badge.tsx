/**
 * Stargazer CLI Design System - Badge Component
 *
 * Status indicator badges with star iconography and theme-aware colors.
 */

import { Text } from 'ink';
import { type ReactNode } from 'react';
import { gradientLine } from '../gradient.js';
import { STAR_ICONS, type PaletteName } from '../palettes.js';
import { statusColors, textColors, brandColors } from '../tokens/colors.js';
import { useTheme } from '../primitives/theme-provider.js';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';

export interface BadgeProps {
  /** Badge variant/status */
  variant?: BadgeVariant;
  /** Content to display */
  children: ReactNode;
  /** Show icon before text */
  showIcon?: boolean;
  /** Use gradient styling */
  gradient?: boolean;
}

/**
 * Map variant to icon
 */
const variantIcons: Record<BadgeVariant, string> = {
  default: STAR_ICONS.outline,
  success: STAR_ICONS.filled,
  warning: STAR_ICONS.outline,
  error: STAR_ICONS.circle,
  info: STAR_ICONS.diamond,
  brand: STAR_ICONS.filled,
};

/**
 * Get theme-aware color for badge variant
 */
function getVariantColor(variant: BadgeVariant, theme: 'dark' | 'light'): string {
  switch (variant) {
    case 'default':
      return textColors[theme].primary;
    case 'brand':
      // brandColors[theme].primary comes from palette array, provide fallback
      return brandColors[theme].primary ?? (theme === 'dark' ? '#7dd3fc' : '#3b82f6');
    case 'success':
      return statusColors.success.text;
    case 'warning':
      return statusColors.warning.text;
    case 'error':
      return statusColors.error.text;
    case 'info':
      return statusColors.info.text;
  }
}

/**
 * Map variant to palette for gradients
 */
const variantPalettes: Record<BadgeVariant, PaletteName> = {
  default: 'moonlight',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'stellar',
  brand: 'stellar',
};

/**
 * Badge Component
 *
 * Displays status with icon and colored text.
 */
export function Badge({
  variant = 'default',
  children,
  showIcon = true,
  gradient = false,
}: BadgeProps) {
  const { theme } = useTheme();
  const icon = variantIcons[variant];
  const color = getVariantColor(variant, theme);
  const palette = variantPalettes[variant];

  const content = showIcon ? `${icon} ${String(children)}` : String(children);

  if (gradient) {
    return (
      <Text>
        {gradientLine(content, { palette })}
      </Text>
    );
  }

  return <Text color={color}>{content}</Text>;
}

/**
 * Status badge with count
 */
export interface CountBadgeProps {
  count: number;
  variant?: BadgeVariant;
  label?: string;
}

export function CountBadge({ count, variant = 'default', label }: CountBadgeProps) {
  const { theme } = useTheme();
  const icon = variantIcons[variant];
  const color = getVariantColor(variant, theme);

  const text = label ? `${icon} ${count} ${label}` : `${icon} ${count}`;

  return <Text color={color}>{text}</Text>;
}

/**
 * Pill-style badge with brackets
 */
export interface PillBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function PillBadge({ children, variant = 'default' }: PillBadgeProps) {
  const { theme } = useTheme();
  const icon = variantIcons[variant];
  const color = getVariantColor(variant, theme);

  return (
    <Text color={color}>
      [{icon} {children}]
    </Text>
  );
}
