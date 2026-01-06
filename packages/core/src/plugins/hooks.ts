import type { StargazerPlugin, ReviewContext } from './types';
import type { Issue } from '../review/types';

/**
 * Payload returned by review operations.
 */
type ReviewResultPayload = {
  issues: Issue[];
  summary: string;
  decision: string;
};

/**
 * Runs beforeReview hooks in sequence.
 * Each plugin receives the context from the previous plugin.
 */
export async function runBeforeReviewHooks(
  plugins: readonly StargazerPlugin[],
  ctx: ReviewContext
): Promise<ReviewContext> {
  let result = ctx;
  for (const plugin of plugins) {
    if (plugin.beforeReview) {
      result = await plugin.beforeReview(result);
    }
  }
  return result;
}

/**
 * Runs afterReview hooks in sequence.
 * Each plugin receives the result from the previous plugin.
 */
export async function runAfterReviewHooks(
  plugins: readonly StargazerPlugin[],
  payload: ReviewResultPayload,
  ctx: ReviewContext
): Promise<ReviewResultPayload> {
  let result = payload;
  for (const plugin of plugins) {
    if (plugin.afterReview) {
      result = await plugin.afterReview(result, ctx);
    }
  }
  return result;
}

/**
 * Runs filterIssues hooks synchronously.
 * Each plugin receives the issues from the previous plugin.
 */
export function runFilterHooks(
  plugins: readonly StargazerPlugin[],
  issues: Issue[]
): Issue[] {
  let result = issues;
  for (const plugin of plugins) {
    if (plugin.filterIssues) {
      result = plugin.filterIssues(result);
    }
  }
  return result;
}
