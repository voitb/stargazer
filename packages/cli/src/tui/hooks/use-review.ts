import { useState, useCallback, useRef } from 'react';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/reviewer';
import type { ReviewResult } from '@stargazer/core';
import { getApiKey, getTimeout, getSelectedModel } from '../storage/api-key-store.js';

export type ReviewPhase = 'preparing' | 'fetching-diff' | 'analyzing' | 'parsing';

// Order of phases for display
export const PHASE_ORDER: readonly ReviewPhase[] = ['preparing', 'fetching-diff', 'analyzing', 'parsing'];

interface UseReviewOptions {
  projectPath: string;
}

interface UseReviewReturn {
  isReviewing: boolean;
  error: string | null;
  result: ReviewResult | null;
  phase: ReviewPhase | null;
  completedPhases: ReviewPhase[];
  timeout: number;
  reviewStaged: () => Promise<ReviewResult | null>;
  reviewUnstaged: () => Promise<ReviewResult | null>;
  cancel: () => void;
  clearResult: () => void;
  clearError: () => void;
}

export function useReview({ projectPath }: UseReviewOptions): UseReviewReturn {
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [phase, setPhase] = useState<ReviewPhase | null>(null);
  const [completedPhases, setCompletedPhases] = useState<ReviewPhase[]>([]);
  const [timeout, setTimeoutValue] = useState(60);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to advance to next phase (marks current as complete)
  const advancePhase = useCallback((nextPhase: ReviewPhase) => {
    setPhase(currentPhase => {
      if (currentPhase) {
        setCompletedPhases(prev => [...prev, currentPhase]);
      }
      return nextPhase;
    });
  }, []);

  const runReview = useCallback(async (staged: boolean): Promise<ReviewResult | null> => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsReviewing(true);
    setError(null);
    setCompletedPhases([]);
    setPhase('preparing');

    try {
      const apiKey = await getApiKey();
      if (!apiKey) {
        setError('No API key configured. Please set up your API key in settings.');
        setIsReviewing(false);
        setPhase(null);
        return null;
      }

      if (signal.aborted) {
        setIsReviewing(false);
        setPhase(null);
        return null;
      }

      const timeoutMs = await getTimeout();
      setTimeoutValue(Math.round(timeoutMs / 1000));

      // Get the user's selected model (or use default)
      const selectedModel = await getSelectedModel();

      // Phase: Fetching diff
      advancePhase('fetching-diff');

      if (signal.aborted) {
        setIsReviewing(false);
        setPhase(null);
        return null;
      }

      // Phase: Analyzing with AI
      advancePhase('analyzing');
      const client = createGeminiClient(apiKey, selectedModel, { timeout: timeoutMs });
      const reviewResult = await reviewDiff(client, { staged, projectPath });

      if (signal.aborted) {
        setIsReviewing(false);
        setPhase(null);
        return null;
      }

      if (!reviewResult.ok) {
        setError(reviewResult.error.message);
        setIsReviewing(false);
        setPhase(null);
        return null;
      }

      // Phase: Parsing response
      advancePhase('parsing');

      // Mark all phases complete
      setCompletedPhases(prev => [...prev, 'parsing']);
      setResult(reviewResult.data);
      setIsReviewing(false);
      setPhase(null);
      return reviewResult.data;
    } catch (e) {
      if (signal.aborted) {
        setIsReviewing(false);
        setPhase(null);
        return null;
      }
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
      setIsReviewing(false);
      setPhase(null);
      return null;
    }
  }, [projectPath, advancePhase]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setPhase(null);
    setIsReviewing(false);
  }, []);

  const reviewStaged = useCallback(() => runReview(true), [runReview]);
  const reviewUnstaged = useCallback(() => runReview(false), [runReview]);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setPhase(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isReviewing,
    error,
    result,
    phase,
    completedPhases,
    timeout,
    reviewStaged,
    reviewUnstaged,
    cancel,
    clearResult,
    clearError,
  };
}
