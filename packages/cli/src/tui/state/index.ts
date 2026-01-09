// Global state - used by all screens
export {
  NavigationProvider,
  useNavigation,
  type NavigationContextValue,
  type Screen,
} from './navigation-context.js';

// Backwards-compatible combined exports
export {
  AppProvider,
  useAppContext,
  type AppContextValue,
} from './app-context.js';

// Feature contexts are now exported from their features:
// import { useChat } from '../features/chat';
// import { useSession } from '../features/sessions';

// Re-exports for backwards compatibility (deprecated - use feature imports)
export {
  SessionProvider,
  useSession,
  type SessionContextValue,
} from '../features/sessions/session.context.js';

export {
  ChatProvider,
  useChat,
  type ChatContextValue,
} from '../features/chat/chat.context.js';
