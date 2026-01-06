export interface ConventionPattern {
  readonly name: string;
  readonly description: string;
  readonly examples: readonly string[];
}

export type ConventionCategory =
  | 'errorHandling'
  | 'naming'
  | 'testing'
  | 'imports';

export interface ProjectConventions {
  readonly version: '1.0';
  readonly discoveredAt: string;
  readonly language: string;
  readonly patterns: {
    readonly errorHandling?: ConventionPattern;
    readonly naming?: ConventionPattern;
    readonly testing?: ConventionPattern;
    readonly imports?: ConventionPattern;
  };
  readonly summary: string;
}

export interface FileContext {
  readonly path: string;
  readonly content: string;
}
