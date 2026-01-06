import type { StargazerPlugin } from '../plugins/types';
import type { Severity } from '../review/types';
import type { Model } from '../gemini/models';

export type { Model };

export type StargazerConfig = {
  readonly model?: Model;
  readonly minSeverity?: Severity;
  readonly maxIssues?: number;
  readonly ignore?: readonly string[];
  readonly plugins?: readonly StargazerPlugin[];
};

export type ResolvedConfig = {
  readonly model: Model;
  readonly minSeverity: Severity;
  readonly maxIssues: number;
  readonly ignore: readonly string[];
  readonly plugins: readonly StargazerPlugin[];
};
