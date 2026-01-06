import type { StargazerPlugin, ReviewContext } from './types';
import type { ReviewResult, Issue } from '../review/types';

export async function runBeforeReviewHooks(
  plugins: readonly StargazerPlugin[],
  ctx: ReviewContext
): Promise<void> {
  for (const plugin of plugins) {
    if (plugin.beforeReview) {
      await plugin.beforeReview(ctx);
    }
  }
}

export async function runAfterReviewHooks(
  plugins: readonly StargazerPlugin[],
  result: ReviewResult,
  ctx: ReviewContext
): Promise<ReviewResult> {
  let current = result;
  for (const plugin of plugins) {
    if (plugin.afterReview) {
      current = await plugin.afterReview(current, ctx);
    }
  }
  return current;
}

export function runFilterHooks(
  plugins: readonly StargazerPlugin[],
  issues: readonly Issue[],
  ctx: ReviewContext
): readonly Issue[] {
  let result = issues;
  for (const plugin of plugins) {
    if (plugin.filterIssues) {
      result = plugin.filterIssues(result, ctx);
    }
  }
  return result;
}
