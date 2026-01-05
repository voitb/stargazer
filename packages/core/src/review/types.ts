export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export const CATEGORIES = ['bug', 'security', 'convention', 'performance'] as const;
export const DECISIONS = ['approve', 'request_changes', 'comment'] as const;

export type Severity = (typeof SEVERITIES)[number];
export type Category = (typeof CATEGORIES)[number];
export type Decision = (typeof DECISIONS)[number];

export type Issue = {
  file: string;
  line: number;
  severity: Severity;
  category: Category;
  message: string;
  suggestion?: string;
  confidence: number;
};

export type ReviewResult = {
  issues: Issue[];
  summary: string;
  decision: Decision;
};

export type ReviewOptions = {
  /** If true (default), review staged changes. If false, review unstaged changes. */
  readonly staged?: boolean;
  /** Optional: provide a diff string directly instead of getting from git. */
  readonly diff?: string;
};
