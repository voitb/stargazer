/**
 * Shared Review Types
 *
 * Types used across multiple features (chat, review, screen-router).
 * Moved here to avoid cross-feature imports per ARCHITECTURE_RULES.md.
 */

import type { ReviewResult } from '@stargazer/core';

/**
 * Actions available for triggering code reviews.
 * Used by chat-screen and screen-router to pass review capabilities.
 */
export interface ReviewActions {
  reviewStaged: () => Promise<ReviewResult | null>;
  reviewUnstaged: () => Promise<ReviewResult | null>;
  isReviewing: boolean;
}
