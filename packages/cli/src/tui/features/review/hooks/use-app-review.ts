import { useState, useCallback, useEffect } from 'react';
import { useReview } from '../use-review.js';
import { useNavigation } from '../../../state/navigation-context.js';
import type { ReviewResult } from '@stargazer/core';
import type { ReviewPhase } from '../types.js';

interface UseAppReviewOptions {
  projectPath: string;
}

export interface UseAppReviewReturn {
  // State
  isReviewing: boolean;
  error: string | null;
  result: ReviewResult | null;
  phase: ReviewPhase | null;
  completedPhases: readonly ReviewPhase[];
  elapsedTime: number;
  timeout: number;
  // Actions
  reviewStaged: () => Promise<ReviewResult | null>;
  reviewUnstaged: () => Promise<ReviewResult | null>;
  handleCancel: () => void;
  clearResult: () => void;
  clearError: () => void;
}

export function useAppReview({ projectPath }: UseAppReviewOptions): UseAppReviewReturn {
  const { navigate, screen } = useNavigation();
  const review = useReview({ projectPath });
  const [elapsedTime, setElapsedTime] = useState(0);

  // Elapsed time tracking
  useEffect(() => {
    if (!review.isReviewing) {
      setElapsedTime(0);
      return;
    }
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [review.isReviewing]);

  // Navigation side effects
  useEffect(() => {
    if (review.isReviewing && screen !== 'loading') {
      navigate('loading');
    } else if (!review.isReviewing && review.result && screen === 'loading') {
      navigate('review');
    } else if (!review.isReviewing && review.error && screen === 'loading') {
      navigate('error');
    }
  }, [review.isReviewing, review.result, review.error, screen, navigate]);

  const handleCancel = useCallback(() => {
    review.cancel();
    navigate('home');
  }, [review, navigate]);

  return {
    // State
    isReviewing: review.isReviewing,
    error: review.error,
    result: review.result,
    phase: review.phase,
    completedPhases: review.completedPhases,
    elapsedTime,
    timeout: review.timeout,
    // Actions
    reviewStaged: review.reviewStaged,
    reviewUnstaged: review.reviewUnstaged,
    handleCancel,
    clearResult: review.clearResult,
    clearError: review.clearError,
  };
}
