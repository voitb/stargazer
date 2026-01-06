import type { StargazerPlugin, ReviewContext } from './types';
import type { Issue } from '../review/types';

type ReviewResultPayload = {
  issues: Issue[];
  summary: string;
  decision: string;
};

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
