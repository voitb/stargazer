/**
 * Stargazer CLI Design System - Toast Component
 *
 * Notification component for temporary messages.
 *
 * @example
 * ```typescript
 * import { Toast } from './toast.js';
 * import { useToast } from '../hooks/use-toast.js';
 *
 * const { toast, ToastContainer } = useToast();
 *
 * toast.success('Changes saved!');
 *
 * <ToastContainer />
 * ```
 */

import { useState, useEffect, type ReactNode } from 'react';
import { Box, Text } from 'ink';
import { STAR_ICONS } from '../../theme/palettes.js';
import { statusColors } from '../../theme/tokens/colors.js';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  /** Toast variant */
  variant?: ToastVariant;
  /** Content to display */
  children: ReactNode;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  autoDismiss?: number;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Show icon */
  showIcon?: boolean;
}

const variantIcons: Record<ToastVariant, string> = {
  info: STAR_ICONS.diamond,
  success: STAR_ICONS.filled,
  warning: STAR_ICONS.outline,
  error: STAR_ICONS.circle,
};

const variantColors: Record<ToastVariant, string> = {
  info: statusColors.info.text,
  success: statusColors.success.text,
  warning: statusColors.warning.text,
  error: statusColors.error.text,
};

/**
 * Toast Component
 *
 * Displays a notification message.
 */
export function Toast({
  variant = 'info',
  children,
  autoDismiss = 3000,
  onDismiss,
  showIcon = true,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  if (!visible) return null;

  const icon = variantIcons[variant];
  const color = variantColors[variant];

  return (
    <Box paddingX={1}>
      <Text color={color}>
        {showIcon && `${icon} `}
        {children}
      </Text>
    </Box>
  );
}

/**
 * Toast data for queue
 */
export interface ToastData {
  id: string;
  variant: ToastVariant;
  message: string;
  duration: number;
}

/**
 * Simple inline notification (non-dismissing)
 */
export interface NotificationProps {
  variant?: ToastVariant;
  children: ReactNode;
}

export function Notification({ variant = 'info', children }: NotificationProps) {
  const icon = variantIcons[variant];
  const color = variantColors[variant];

  return (
    <Text color={color}>
      {icon} {children}
    </Text>
  );
}
