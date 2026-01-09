// Re-export from feature modules for backwards compatibility
// New code should import directly from features
export { useReview } from '../features/review/use-review.js';
export { useSettings, type UseSettingsReturn, type SettingsModal } from '../features/settings/use-settings.js';

// App-level hooks
export { useAppReview, type UseAppReviewReturn } from './use-app-review.js';
export { useAppKeyboard } from './use-app-keyboard.js';

// Utility hooks
export { useTerminalCapabilities, type TerminalCapabilities } from './use-terminal-capabilities.js';
export { useGracefulExit } from './use-graceful-exit.js';
