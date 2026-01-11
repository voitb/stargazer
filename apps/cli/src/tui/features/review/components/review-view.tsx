import React from 'react';
import { Box, Text } from 'ink';
import type { ReviewResult, Issue, Decision } from '@stargazer/core';
import { MISC_ICONS } from '../../../config/icons.js';
import { Divider } from '../../../components/display/divider.js';
import { CodeText, HintText } from '../../../components/display/labels.js';
import { ScreenTitle } from '../../../components/display/titles.js';
import { Badge } from '../../../components/feedback/badge.js';
import { SeverityText, StatusText, type SeverityLevel } from '../../../components/feedback/status-text.js';

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

/**
 * Map decision to badge variant for proper coloring
 */
const DECISION_VARIANTS: Record<Decision, 'success' | 'error' | 'info'> = {
  approve: 'success',
  request_changes: 'error',
  comment: 'info',
};

/**
 * Map decision to display label
 */
const DECISION_LABELS: Record<Decision, string> = {
  approve: 'Approved',
  request_changes: 'Changes Requested',
  comment: 'Comment',
};

export function ReviewView({ result }: ReviewViewProps) {
  const variant = DECISION_VARIANTS[result.decision] ?? 'info';
  const label = DECISION_LABELS[result.decision] ?? result.decision;

  return (
    <Box flexDirection="column" padding={1}>
      <ScreenTitle>{MISC_ICONS.pencil} Code Review Results</ScreenTitle>

      <Box marginTop={1}>
        <Text>Decision: </Text>
        <Badge variant={variant} gradient>{label}</Badge>
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
                <React.Fragment key={i}>
                  <IssueItem issue={issue} index={i} />
                  {i < result.issues.length - 1 && (
                    <Divider variant="dots" width={40} dimmed />
                  )}
                </React.Fragment>
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
