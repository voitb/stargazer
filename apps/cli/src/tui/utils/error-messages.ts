/**
 * User-friendly error message formatting for the TUI.
 * Maps technical error messages to actionable user guidance.
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion: string;
}

/**
 * Converts raw error messages into user-friendly format with
 * title, message, and actionable suggestion.
 */
export function getUserFriendlyError(errorMsg: string): UserFriendlyError {
  const lower = errorMsg.toLowerCase();

  if (lower.includes('timed out') || lower.includes('timeout')) {
    return {
      title: 'Request Timed Out',
      message: 'The AI review took too long to complete.',
      suggestion: 'Try reviewing fewer files, or increase timeout in Settings.',
    };
  }

  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('invalid api key')) {
    return {
      title: 'Authentication Failed',
      message: 'Your API key appears to be invalid.',
      suggestion: 'Go to Settings to update your API key.',
    };
  }

  if (lower.includes('429') || lower.includes('rate limit')) {
    return {
      title: 'Rate Limited',
      message: 'Too many requests to the Gemini API.',
      suggestion: 'Wait a moment and try again.',
    };
  }

  if (lower.includes('no changes') || lower.includes('empty') || lower.includes('no diff')) {
    return {
      title: 'No Changes Found',
      message: 'No staged/unstaged changes detected.',
      suggestion: 'Make sure you have changes to review.',
    };
  }

  if (lower.includes('cancelled') || lower.includes('aborted')) {
    return {
      title: 'Review Cancelled',
      message: 'The review was cancelled.',
      suggestion: 'Press ESC to go back to the menu.',
    };
  }

  if (
    lower.includes('connection') ||
    lower.includes('econnrefused') ||
    lower.includes('etimedout') ||
    lower.includes('fetch failed') ||
    lower.includes('network')
  ) {
    return {
      title: 'Connection Failed',
      message: 'Could not connect to the AI service.',
      suggestion: 'Check your internet connection and try again.',
    };
  }

  return {
    title: 'Error',
    message: errorMsg,
    suggestion: 'Press ESC to go back and try again.',
  };
}
