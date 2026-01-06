import type { Issue } from '../review/types';

export type ReviewContext = {
  readonly diff: string;
  readonly files: readonly string[];
  readonly projectDir: string;
};

export type StargazerPlugin = {
  readonly name: string;
  readonly beforeReview?: (
    ctx: ReviewContext
  ) => ReviewContext | Promise<ReviewContext>;
  readonly afterReview?: (
    result: { issues: Issue[]; summary: string; decision: string },
    ctx: ReviewContext
  ) => { issues: Issue[]; summary: string; decision: string } | Promise<{ issues: Issue[]; summary: string; decision: string }>;
  readonly filterIssues?: (issues: Issue[]) => Issue[];
};

export type PluginFactory<T = void> = (options?: T) => StargazerPlugin;
