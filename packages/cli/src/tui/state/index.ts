// Backwards-compatible combined exports
export {
  AppProvider,
  useAppContext,
  type Screen,
  type AppContextValue,
} from './app-context.js';

// Individual context exports (preferred for new code)
export {
  NavigationProvider,
  useNavigation,
  type NavigationContextValue,
} from './navigation-context.js';

export {
  SessionProvider,
  useSession,
  type SessionContextValue,
} from './session-context.js';

export {
  ChatProvider,
  useChat,
  type ChatContextValue,
} from './chat-context.js';
