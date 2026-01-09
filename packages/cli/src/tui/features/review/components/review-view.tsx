import { Box, Text } from 'ink';
import type { ReviewResult, Issue, Severity } from '@stargazer/core';
import { DECISION_ICONS, MISC_ICONS } from '../../../config/icons.js';
import {
  ScreenTitle,
  SeverityText,
  CodeText,
  StatusText,
  HintText,
  type SeverityLevel,
} from '../../../design-system/index.js';

interface ReviewViewProps {
  result: ReviewResult;
}

function IssueItem({ issue, index }: { issue: Issue; index: number }) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold>{index + 1}. </Text>
        <SeverityText severity={issue.severity as SeverityLevel} />
        <Text> </Text>
        <CodeText>{issue.file}:{issue.line}</CodeText>
      </Box>
      <Box marginLeft={3}>
        <Text>{issue.message}</Text>
      </Box>
      {issue.suggestion && (
        <Box marginLeft={3}>
          <HintText>{MISC_ICONS.lightbulb} {issue.suggestion}</HintText>
        </Box>
      )}
    </Box>
  );
}

export function ReviewView({ result }: ReviewViewProps) {
  const decisionIcon = DECISION_ICONS[result.decision] || '◇';

  return (
    <Box flexDirection="column" padding={1}>
      <ScreenTitle>{MISC_ICONS.pencil} Code Review Results</ScreenTitle>

      <Box marginTop={1}>
        <Text>Decision: {decisionIcon} </Text>
        <Text bold>{result.decision}</Text>
      </Box>

      <Box marginTop={1}>
        <Text>{result.summary}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {result.issues.length === 0 ? (
          <StatusText variant="success" withIcon>No issues found!</StatusText>
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
        <HintText>Press ESC or B to go back to menu</HintText>
      </Box>
    </Box>
  );
}
