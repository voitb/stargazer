import type { ReviewResult, Issue } from '../review/types';
import type { ProjectConventions } from '../conventions/types';

export interface StargazerPlugin {
  readonly name: string;

  readonly beforeReview?: (ctx: ReviewContext) => void | Promise<void>;

  readonly afterReview?: (
    result: ReviewResult,
    ctx: ReviewContext
  ) => ReviewResult | Promise<ReviewResult>;

  readonly filterIssues?: (
    issues: readonly Issue[],
    ctx: ReviewContext
  ) => readonly Issue[];
}

export interface ReviewContext {
  readonly diff: string;
  readonly projectPath?: string;
  readonly conventions?: ProjectConventions;
}

export type PluginFactory<T = void> = (options?: T) => StargazerPlugin;
