import { Box, Text } from 'ink';
import { gradientLine, StarSpinner, Badge, StatusText, useTheme } from '../../../design-system/index.js';
import { PHASE_ORDER, type ReviewPhase } from '../types.js';

/**
 * Star-themed phase icons
 */
const PHASE_ICONS = {
  completed: '✦',
  current: '✧',
  pending: '○',
} as const;

/**
 * Maps review phases to human-readable labels with star styling.
 */
function getPhaseLabel(phase: ReviewPhase): string {
  switch (phase) {
    case 'preparing':
      return 'Preparing review';
    case 'fetching-diff':
      return 'Fetching git diff';
    case 'analyzing':
      return 'Analyzing with AI';
    case 'parsing':
      return 'Parsing response';
  }
}

export interface ProgressPhasesProps {
  currentPhase: ReviewPhase | null;
  completedPhases: readonly ReviewPhase[];
}

/**
 * Displays review progress with star-themed phase indicators.
 *
 * States:
 * - Completed: ✦ (stellar gradient)
 * - Current: ✧ + spinner (cosmic gradient)
 * - Pending: ○ (dimmed)
 *
 * Following CLI_ARCHITECTURE.md component guidelines.
 */
export function ProgressPhases({ currentPhase, completedPhases }: ProgressPhasesProps) {
  const { primaryPalette } = useTheme();

  return (
    <Box flexDirection="column" gap={0}>
      {PHASE_ORDER.map((phase) => {
        const isCompleted = completedPhases.includes(phase);
        const isCurrent = phase === currentPhase;
        const isPending = !isCompleted && !isCurrent;
        const label = getPhaseLabel(phase);

        return (
          <Box key={phase} gap={1}>
            {isCompleted && (
              <Badge variant="success" showIcon={true} gradient>
                {label}
              </Badge>
            )}
            {isCurrent && (
              <Box gap={1}>
                <StarSpinner palette={primaryPalette} />
                <StatusText variant="info" bold>
                  {label}...
                </StatusText>
              </Box>
            )}
            {isPending && (
              <Text dimColor>{PHASE_ICONS.pending} {label}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * Compact progress indicator - single line
 */
export function CompactProgress({
  currentPhase,
  completedPhases,
}: ProgressPhasesProps) {
  const { primaryPalette } = useTheme();
  const completed = completedPhases.length;
  const total = PHASE_ORDER.length;
  const progress = `${completed}/${total}`;

  const currentLabel = currentPhase ? getPhaseLabel(currentPhase) : 'Done';

  return (
    <Box gap={1}>
      <Text>
        {gradientLine(`✦ ${progress}`, { palette: primaryPalette })}
      </Text>
      <Text dimColor>│</Text>
      <StarSpinner palette={primaryPalette} />
      <StatusText variant="info"> {currentLabel}...</StatusText>
    </Box>
  );
}
