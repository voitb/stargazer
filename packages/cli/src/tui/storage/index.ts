/**
 * Storage module - Public API
 *
 * Exports only the functions and types that should be used externally.
 * Internal implementation details are not exposed.
 */

// Paths
export {
  getStargazerDir,
  getSessionsDir,
  getSessionDir,
  getSessionIndexPath,
  getConfigPath,
  ensureDir,
  ensureStorageStructure,
} from './paths.js';

// Schemas (validation)
export {
  ChatMessageRoleSchema,
  ReviewDecisionSchema,
  ChatMessageSchema,
  SessionMetadataSchema,
  SessionIndexEntrySchema,
  SessionIndexSchema,
  SessionDataSchema,
  MessagesArraySchema,
} from './schemas.js';

// Types (re-exported from schemas)
export type {
  ChatMessageRole,
  ReviewDecision,
  ChatMessage,
  SessionMetadata,
  SessionIndexEntry,
  SessionIndex,
  SessionData,
} from './types.js';

// Session store functions
export {
  loadSessionIndex,
  saveSessionIndex,
  createSession,
  loadSession,
  addMessageToSession,
  deleteSession,
  listAllSessions,
  clearSessionMessages,
} from './session-store.js';

// API key store functions
export {
  getApiKey,
  saveApiKey,
  hasApiKey,
  clearApiKey,
  maskApiKey,
  getTimeout,
  saveTimeout,
  getProvider,
  saveProvider,
  getSelectedModel,
  saveSelectedModel,
  getDefaultModel,
  getSecondaryModel,
} from './api-key-store.js';

// Provider type
export type { Provider } from './api-key-store.js';
