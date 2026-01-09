/**
 * Stargazer CLI Design System - Badge Component
 *
 * Status indicator badges with star iconography and theme-aware colors.
 */

import { Text } from 'ink';
import { type ReactNode } from 'react';
import { gradientLine } from '../gradient.js';
import { STAR_ICONS, type PaletteName } from '../palettes.js';
import { statusColors } from '../tokens/colors.js';

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
 * Map variant to theme-aware hex color
 */
const variantColors: Record<BadgeVariant, string> = {
  default: '#f8fafc',
  success: statusColors.success.text,
  warning: statusColors.warning.text,
  error: statusColors.error.text,
  info: statusColors.info.text,
  brand: '#7dd3fc', // stellar cyan - brand color
};

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
  const icon = variantIcons[variant];
  const color = variantColors[variant];
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
 * Shorthand badge components
 */
export function SuccessBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="success" {...props}>{children}</Badge>;
}

export function WarningBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="warning" {...props}>{children}</Badge>;
}

export function ErrorBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="error" {...props}>{children}</Badge>;
}

export function InfoBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="info" {...props}>{children}</Badge>;
}

export function BrandBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="brand" {...props}>{children}</Badge>;
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
  const icon = variantIcons[variant];
  const color = variantColors[variant];

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
  const icon = variantIcons[variant];
  const color = variantColors[variant];

  return (
    <Text color={color}>
      [{icon} {children}]
    </Text>
  );
}
