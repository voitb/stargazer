import { useReducer, useCallback, useRef, useEffect } from 'react';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/reviewer';
import type { ReviewResult } from '@stargazer/core';
import { getApiKey, getTimeout, getSelectedModel } from '../../storage/api-key-store.js';
import {
  reviewReducer,
  initialReviewState,
  type ReviewState,
  type ReviewPhase,
  PHASE_ORDER,
} from './types.js';

// Re-export for consumers
export { type ReviewPhase, PHASE_ORDER };

interface UseReviewOptions {
  projectPath: string;
}

interface UseReviewReturn {
  // Derived state for backwards compatibility
  isReviewing: boolean;
  error: string | null;
  result: ReviewResult | null;
  phase: ReviewPhase | null;
  completedPhases: readonly ReviewPhase[];
  timeout: number;
  // Actions
  reviewStaged: () => Promise<ReviewResult | null>;
  reviewUnstaged: () => Promise<ReviewResult | null>;
  cancel: () => void;
  clearResult: () => void;
  clearError: () => void;
  // Full state for advanced usage
  state: ReviewState;
}

export function useReview({ projectPath }: UseReviewOptions): UseReviewReturn {
  const [state, dispatch] = useReducer(reviewReducer, initialReviewState);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const runReview = useCallback(
    async (staged: boolean): Promise<ReviewResult | null> => {
      // Create new abort controller for this review
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        // Get configuration
        const apiKey = await getApiKey();
        if (!apiKey) {
          dispatch({
            type: 'FAIL',
            error: 'No API key configured. Please set up your API key in settings.',
          });
          return null;
        }

        const timeoutMs = await getTimeout();
        const timeoutSec = Math.round(timeoutMs / 1000);

        // Start review
        dispatch({ type: 'START_REVIEW', timeout: timeoutSec });

        if (signal.aborted) {
          dispatch({ type: 'CANCEL' });
          return null;
        }

        // Get the user's selected model
        const selectedModel = await getSelectedModel();

        // Phase: Fetching diff
        dispatch({ type: 'ADVANCE_PHASE', phase: 'fetching-diff' });

        if (signal.aborted) {
          dispatch({ type: 'CANCEL' });
          return null;
        }

        // Phase: Analyzing with AI
        dispatch({ type: 'ADVANCE_PHASE', phase: 'analyzing' });
        const client = createGeminiClient(apiKey, selectedModel, {
          timeout: timeoutMs,
        });
        const reviewResult = await reviewDiff(client, { staged, projectPath });

        if (signal.aborted) {
          dispatch({ type: 'CANCEL' });
          return null;
        }

        if (!reviewResult.ok) {
          dispatch({ type: 'FAIL', error: reviewResult.error.message });
          return null;
        }

        // Phase: Parsing response
        dispatch({ type: 'ADVANCE_PHASE', phase: 'parsing' });

        // Complete
        dispatch({ type: 'COMPLETE', result: reviewResult.data });
        return reviewResult.data;
      } catch (e) {
        if (signal.aborted) {
          dispatch({ type: 'CANCEL' });
          return null;
        }
        const errorMessage = e instanceof Error ? e.message : String(e);
        dispatch({ type: 'FAIL', error: errorMessage });
        return null;
      }
    },
    [projectPath]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    dispatch({ type: 'RESET' });
  }, []);

  const reviewStaged = useCallback(() => runReview(true), [runReview]);
  const reviewUnstaged = useCallback(() => runReview(false), [runReview]);

  const clearResult = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Derive values from state for backwards compatibility
  const isReviewing = state.status === 'reviewing';
  const error = state.status === 'error' ? state.error : null;
  const result = state.status === 'success' ? state.result : null;
  const phase = state.status === 'reviewing' ? state.phase : null;
  const completedPhases =
    state.status === 'reviewing' || state.status === 'success' || state.status === 'error'
      ? state.completedPhases
      : [];
  const timeout = state.status === 'reviewing' ? state.timeout : 60;

  return {
    // Derived state
    isReviewing,
    error,
    result,
    phase,
    completedPhases,
    timeout,
    // Actions
    reviewStaged,
    reviewUnstaged,
    cancel,
    clearResult,
    clearError,
    // Full state
    state,
  };
}
