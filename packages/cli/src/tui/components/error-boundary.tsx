import { Box, Text } from 'ink';
import { Component, type ReactNode } from 'react';
import { statusColors, STAR_ICONS } from '../design-system/index.js';

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Error boundary for the TUI application.
 * Catches JavaScript errors during rendering and displays a fallback UI.
 */
export class TUIErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log the error for debugging
    console.error('TUI Error:', error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color={statusColors.error.text} bold>
            {STAR_ICONS.circle} Something went wrong
          </Text>
          <Text dimColor>{this.state.error.message}</Text>
          <Text>Press Ctrl+C to exit, or check logs for details.</Text>
        </Box>
      );
    }
    return this.props.children;
  }
}
