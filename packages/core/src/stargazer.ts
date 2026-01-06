import type { Result } from './shared/result';
import type { ReviewResult } from './review/types';
import type { ProjectConventions } from './conventions/types';
import type { ResolvedConfig, StargazerConfig } from './config/types';
import { ok, err } from './shared/result';
import { createGeminiClient } from './gemini/client';
import { resolveConfig } from './config/resolve';
import { reviewDiff } from './review/reviewer';
import { discoverConventions } from './conventions/discovery';
import { saveConventions } from './conventions/cache';

export type ReviewOptions = {
  readonly staged?: boolean;
  readonly diff?: string;
};

export type StargazerOptions = {
  readonly apiKey: string;
  readonly config?: StargazerConfig;
  readonly projectDir?: string;
};

export type Stargazer = {
  readonly config: ResolvedConfig;
  readonly projectDir: string;
  readonly review: (options?: ReviewOptions) => Promise<Result<ReviewResult>>;
  readonly discover: () => Promise<Result<ProjectConventions>>;
};

export function createStargazer(
  options: StargazerOptions
): Result<Stargazer> {
  const { apiKey, projectDir = process.cwd() } = options;

  if (!apiKey) {
    return err({
      code: 'UNAUTHORIZED',
      message: 'API key is required. Set GEMINI_API_KEY environment variable.',
    });
  }

  const config = resolveConfig(options.config);
  const client = createGeminiClient(apiKey, config.model);

  const stargazer: Stargazer = {
    config,
    projectDir,

    review: async (reviewOptions = {}) => {
      return reviewDiff(client, {
        staged: reviewOptions.staged ?? true,
        diff: reviewOptions.diff,
        projectPath: projectDir,
      });
    },

    discover: async () => {
      const result = await discoverConventions(client, {
        projectPath: projectDir,
      });

      if (result.ok) {
        await saveConventions(projectDir, result.data);
      }

      return result;
    },
  };

  return ok(stargazer);
}
