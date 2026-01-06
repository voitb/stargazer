export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export const CATEGORIES = ['bug', 'security', 'convention', 'performance'] as const;
export const DECISIONS = ['approve', 'request_changes', 'comment'] as const;

export type Severity = (typeof SEVERITIES)[number];
export type Category = (typeof CATEGORIES)[number];
export type Decision = (typeof DECISIONS)[number];

export type Issue = {
  readonly file: string;
  readonly line: number;
  readonly severity: Severity;
  readonly category: Category;
  readonly message: string;
  readonly suggestion?: string;
  readonly confidence: number;
  readonly conventionRef?: string;
};

export type ReviewResult = {
  readonly issues: readonly Issue[];
  readonly summary: string;
  readonly decision: Decision;
};

export type ReviewOptions = {
  readonly staged?: boolean;
  readonly diff?: string;
  readonly projectPath?: string;
};
