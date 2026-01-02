export type ErrorCode =
  | 'API_ERROR'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'BAD_REQUEST'
  | 'EMPTY_RESPONSE'
  | 'SCHEMA_VALIDATION'
  | 'CONFIG_INVALID'
  | 'GIT_ERROR'
  | 'TIMEOUT'
  | 'FILE_NOT_FOUND';

export type ApiError = {
  readonly code: ErrorCode;
  readonly message: string;
  readonly cause?: unknown;
};
