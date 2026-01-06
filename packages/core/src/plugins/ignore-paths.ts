import type { PluginFactory, StargazerPlugin } from './types';

export type IgnorePathsOptions = {
  paths: readonly string[];
};

export const ignorePathsPlugin: PluginFactory<IgnorePathsOptions> = (options): StargazerPlugin => ({
  name: 'ignore-paths',

  filterIssues: (issues) => {
    if (!options?.paths.length) return issues;

    return issues.filter((issue) => {
      const shouldIgnore = options.paths.some((pattern) =>
        issue.file.includes(pattern)
      );
      return !shouldIgnore;
    });
  },
});
