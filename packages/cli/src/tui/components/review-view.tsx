import { Box, Text } from 'ink';
import type { ReviewResult, Issue, Severity } from '@stargazer/core';
import { DECISION_ICONS, MISC_ICONS } from '../constants/icons.js';

interface ReviewViewProps {
  result: ReviewResult;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'red',
  high: 'red',
  medium: 'yellow',
  low: 'blue',
};

function IssueItem({ issue, index }: { issue: Issue; index: number }) {
  const color = SEVERITY_COLORS[issue.severity] || 'white';

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold>{index + 1}. </Text>
        <Text color={color} bold>[{issue.severity.toUpperCase()}]</Text>
        <Text color="cyan"> {issue.file}:{issue.line}</Text>
      </Box>
      <Box marginLeft={3}>
        <Text>{issue.message}</Text>
      </Box>
      {issue.suggestion && (
        <Box marginLeft={3}>
          <Text dimColor>{MISC_ICONS.lightbulb} {issue.suggestion}</Text>
        </Box>
      )}
    </Box>
  );
}

export function ReviewView({ result }: ReviewViewProps) {
  const decisionIcon = DECISION_ICONS[result.decision] || '❓';

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">{MISC_ICONS.pencil} Code Review Results</Text>

      <Box marginTop={1}>
        <Text>Decision: {decisionIcon} </Text>
        <Text bold>{result.decision}</Text>
      </Box>

      <Box marginTop={1}>
        <Text>{result.summary}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {result.issues.length === 0 ? (
          <Text color="green">{MISC_ICONS.checkmark} No issues found!</Text>
        ) : (
          <>
            <Text bold>Found {result.issues.length} issue(s):</Text>
            <Box marginTop={1} flexDirection="column">
              {result.issues.map((issue, i) => (
                <IssueItem key={i} issue={issue} index={i} />
              ))}
            </Box>
          </>
        )}
      </Box>

      <Box marginTop={2}>
        <Text dimColor>Press ESC or B to go back to menu</Text>
      </Box>
    </Box>
  );
}
