import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { PHASE_ORDER, type ReviewPhase } from '../hooks/use-review.js';

/**
 * Maps review phases to human-readable labels.
 */
function getPhaseLabel(phase: ReviewPhase): string {
  switch (phase) {
    case 'preparing':
      return 'Preparing review...';
    case 'fetching-diff':
      return 'Fetching git diff...';
    case 'analyzing':
      return 'Analyzing with AI...';
    case 'parsing':
      return 'Parsing response...';
  }
}

export interface ProgressPhasesProps {
  currentPhase: ReviewPhase | null;
  completedPhases: readonly ReviewPhase[];
}

/**
 * Displays review progress with phase indicators.
 * Shows completed (✓), current (spinner), and pending (○) states.
 */
export function ProgressPhases({ currentPhase, completedPhases }: ProgressPhasesProps) {
  return (
    <Box flexDirection="column">
      {PHASE_ORDER.map((phase) => {
        const isCompleted = completedPhases.includes(phase);
        const isCurrent = phase === currentPhase;
        const isPending = !isCompleted && !isCurrent;

        return (
          <Box key={phase}>
            {isCompleted && <Text color="green">✓ </Text>}
            {isCurrent && (
              <>
                <Spinner />
                <Text> </Text>
              </>
            )}
            {isPending && <Text dimColor>○ </Text>}
            <Text
              color={isCompleted ? 'green' : isCurrent ? 'yellow' : undefined}
              dimColor={isPending}
            >
              {getPhaseLabel(phase)}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
