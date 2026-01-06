import { Box, Text } from 'ink';
import type { ReviewResult, Issue } from '@stargazer/core';

interface ReviewViewProps {
  result: ReviewResult;
  onBack: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'red',
  high: 'red',
  medium: 'yellow',
  low: 'blue',
};

const DECISION_ICONS: Record<string, string> = {
  approve: '✅',
  request_changes: '🔴',
  comment: '💬',
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
          <Text dimColor>💡 {issue.suggestion}</Text>
        </Box>
      )}
    </Box>
  );
}

export function ReviewView({ result, onBack }: ReviewViewProps) {
  const decisionIcon = DECISION_ICONS[result.decision] || '❓';

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">📝 Code Review Results</Text>

      <Box marginTop={1}>
        <Text>Decision: {decisionIcon} </Text>
        <Text bold>{result.decision}</Text>
      </Box>

      <Box marginTop={1}>
        <Text>{result.summary}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {result.issues.length === 0 ? (
          <Text color="green">✓ No issues found!</Text>
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
