import type { ReviewResult } from '@stargazer/core';

/**
 * Phases of the review process.
 */
export type ReviewPhase = 'preparing' | 'fetching-diff' | 'analyzing' | 'parsing';

/**
 * Order of phases for progress display.
 */
export const PHASE_ORDER: readonly ReviewPhase[] = [
  'preparing',
  'fetching-diff',
  'analyzing',
  'parsing',
];

/**
 * Discriminated union representing all possible review states.
 * This prevents impossible state combinations at compile time.
 */
export type ReviewState =
  | { status: 'idle' }
  | {
      status: 'reviewing';
      phase: ReviewPhase;
      completedPhases: readonly ReviewPhase[];
      timeout: number;
    }
  | {
      status: 'success';
      result: ReviewResult;
      completedPhases: readonly ReviewPhase[];
    }
  | {
      status: 'error';
      error: string;
      completedPhases: readonly ReviewPhase[];
    }
  | { status: 'cancelled' };

/**
 * Actions that can be dispatched to the review reducer.
 */
export type ReviewAction =
  | { type: 'START_REVIEW'; timeout: number }
  | { type: 'ADVANCE_PHASE'; phase: ReviewPhase }
  | { type: 'COMPLETE'; result: ReviewResult }
  | { type: 'FAIL'; error: string }
  | { type: 'CANCEL' }
  | { type: 'RESET' };

/**
 * Initial state for the review reducer.
 */
export const initialReviewState: ReviewState = { status: 'idle' };

/**
 * Reducer for review state transitions.
 * Enforces valid state transitions and maintains type safety.
 */
export function reviewReducer(
  state: ReviewState,
  action: ReviewAction
): ReviewState {
  switch (action.type) {
    case 'START_REVIEW':
      return {
        status: 'reviewing',
        phase: 'preparing',
        completedPhases: [],
        timeout: action.timeout,
      };

    case 'ADVANCE_PHASE':
      if (state.status !== 'reviewing') return state;
      return {
        ...state,
        completedPhases: [...state.completedPhases, state.phase],
        phase: action.phase,
      };

    case 'COMPLETE':
      if (state.status !== 'reviewing') return state;
      return {
        status: 'success',
        result: action.result,
        completedPhases: [...state.completedPhases, state.phase],
      };

    case 'FAIL':
      return {
        status: 'error',
        error: action.error,
        completedPhases: state.status === 'reviewing' ? state.completedPhases : [],
      };

    case 'CANCEL':
      return { status: 'cancelled' };

    case 'RESET':
      return { status: 'idle' };

    default:
      return state;
  }
}
