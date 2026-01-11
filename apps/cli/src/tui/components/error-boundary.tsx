import { Box, Text } from 'ink';
import { Component, type ReactNode } from 'react';
import { useTheme } from '../theme/index.js';
import { STAR_ICONS } from '../theme/palettes.js';

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Theme-aware error display component
 * Uses the useTheme hook to get correct colors for dark/light mode
 */
function ThemedErrorDisplay({ error }: { error: Error }) {
  const { colors } = useTheme();

  return (
    <Box flexDirection="column" padding={1}>
      <Text color={colors.border.error} bold>
        {STAR_ICONS.circle} Something went wrong
      </Text>
      <Text dimColor>{error.message}</Text>
      <Text>Press Ctrl+C to exit, or check logs for details.</Text>
    </Box>
  );
}

/**
 * Error boundary for the TUI application.
 * Catches JavaScript errors during rendering and displays a fallback UI.
 *
 * Note: Uses a functional wrapper (ThemedErrorDisplay) for theme-awareness,
 * since hooks cannot be used in class components.
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
      return <ThemedErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
