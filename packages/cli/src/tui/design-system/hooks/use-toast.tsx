/**
 * Stargazer CLI Design System - Toast Hook
 *
 * Hook for managing toast notifications queue.
 *
 * @example
 * ```typescript
 * const { toast, ToastContainer } = useToast();
 *
 * toast.success('Changes saved!');
 * toast.error('Failed to save');
 *
 * <ToastContainer />
 * ```
 */

import { useState, useCallback } from 'react';
import { Box } from 'ink';
import { Toast, type ToastVariant, type ToastData } from '../components/toast.js';

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
