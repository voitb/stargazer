/**
 * Global State Module
 *
 * Provides app-level state management for the TUI:
 * - AppProvider: Combined provider for all app state
 * - useAppContext: Primary hook for accessing app state
 *
 * For performance-critical components, use individual hooks:
 * - useNavigation() - only re-renders on navigation changes
 * - useSession() - only re-renders on session changes (from features/sessions)
 * - useChat() - only re-renders on message changes (from features/chat)
 */

// Navigation context
export {
  NavigationProvider,
  useNavigation,
  type NavigationContextValue,
  type Screen,
} from './navigation-context.js';

// Combined provider and hook (primary API)
export {
  AppProvider,
  useAppContext,
  type AppContextValue,
} from './app-context.js';
