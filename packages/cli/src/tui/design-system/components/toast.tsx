/**
 * Stargazer CLI Design System - Toast Component
 *
 * Notification component for temporary messages.
 *
 * @example
 * ```typescript
 * import { Toast, useToast } from './toast.js';
 *
 * const { toast, ToastContainer } = useToast();
 *
 * toast.success('Changes saved!');
 *
 * <ToastContainer />
 * ```
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Box, Text } from 'ink';
import { STAR_ICONS } from '../palettes.js';

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
  info: 'cyan',
  success: 'green',
  warning: 'yellow',
  error: 'red',
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
 * Hook for managing toast notifications
 */
export function useToast(defaultDuration = 3000) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (variant: ToastVariant, message: string, customDuration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: ToastData = {
        id,
        variant,
        message,
        duration: customDuration ?? defaultDuration,
      };

      setToasts((prev) => [...prev, toast]);
      return id;
    },
    [defaultDuration]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    info: (message: string, duration?: number) => addToast('info', message, duration),
    success: (message: string, duration?: number) => addToast('success', message, duration),
    warning: (message: string, duration?: number) => addToast('warning', message, duration),
    error: (message: string, duration?: number) => addToast('error', message, duration),
  };

  const ToastContainer = () => (
    <Box flexDirection="column">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          autoDismiss={t.duration}
          onDismiss={() => removeToast(t.id)}
        >
          {t.message}
        </Toast>
      ))}
    </Box>
  );

  return { toast, toasts, removeToast, ToastContainer };
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
