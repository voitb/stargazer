---
id: task-142
title: Create Card component
status: pending
priority: high
labels:
  - cli
  - design-system
  - components
created: '2025-01-09'
order: 142
assignee: glm
depends_on:
  - task-131
  - task-134
---

## Description

Create a Card component for elevated surface containers.
Provides consistent styling for content panels and containers.

## Reference

See: `packages/cli/CLI_DESIGN_SYSTEM.md` - Component Library section

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/design-system/components/card.tsx`
- [ ] Support variants: default, elevated
- [ ] Support border styles: single, round, star
- [ ] Support Card.Header, Card.Body, Card.Footer sub-components
- [ ] Theme-aware colors

## Implementation

**File**: `packages/cli/src/tui/design-system/components/card.tsx`

```typescript
/**
 * Stargazer CLI Design System - Card Component
 *
 * Elevated surface container for grouping related content.
 *
 * @example
 * ```typescript
 * import { Card } from './card.js';
 *
 * <Card variant="elevated" borderStyle="round">
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content</Card.Body>
 *   <Card.Footer>Footer</Card.Footer>
 * </Card>
 * ```
 */

import { Box, Text, type BoxProps } from 'ink';
import { type ReactNode, createContext, useContext } from 'react';
import { spacing } from '../tokens/spacing.js';
import { borderStyles, type BorderStyle } from '../tokens/borders.js';

export type CardVariant = 'default' | 'elevated';

export interface CardProps {
  /** Card variant */
  variant?: CardVariant;
  /** Border style */
  borderStyle?: BorderStyle;
  /** Border color (Ink color name) */
  borderColor?: string;
  /** Padding inside card */
  padding?: number;
  /** Children */
  children: ReactNode;
  /** Additional Box props */
  width?: BoxProps['width'];
  flexGrow?: BoxProps['flexGrow'];
}

// Context to share card state with sub-components
const CardContext = createContext<{ variant: CardVariant }>({ variant: 'default' });

/**
 * Card Component
 *
 * Container with border and optional elevated styling.
 */
export function Card({
  variant = 'default',
  borderStyle = 'round',
  borderColor = 'gray',
  padding = spacing.md,
  children,
  width,
  flexGrow,
}: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <Box
        flexDirection="column"
        borderStyle={borderStyles[borderStyle]}
        borderColor={borderColor}
        padding={padding}
        width={width}
        flexGrow={flexGrow}
      >
        {children}
      </Box>
    </CardContext.Provider>
  );
}

/**
 * Card Header
 *
 * Title area at top of card with optional bottom border.
 */
export interface CardHeaderProps {
  children: ReactNode;
  /** Show border below header */
  bordered?: boolean;
}

function CardHeader({ children, bordered = false }: CardHeaderProps) {
  return (
    <Box
      flexDirection="column"
      marginBottom={bordered ? spacing.sm : 0}
      paddingBottom={bordered ? spacing.xs : 0}
      borderStyle={bordered ? 'single' : undefined}
      borderTop={false}
      borderLeft={false}
      borderRight={false}
      borderColor="gray"
    >
      <Text bold>{children}</Text>
    </Box>
  );
}

/**
 * Card Body
 *
 * Main content area of the card.
 */
export interface CardBodyProps {
  children: ReactNode;
}

function CardBody({ children }: CardBodyProps) {
  return (
    <Box flexDirection="column" flexGrow={1}>
      {children}
    </Box>
  );
}

/**
 * Card Footer
 *
 * Footer area at bottom of card with optional top border.
 */
export interface CardFooterProps {
  children: ReactNode;
  /** Show border above footer */
  bordered?: boolean;
}

function CardFooter({ children, bordered = false }: CardFooterProps) {
  return (
    <Box
      flexDirection="row"
      justifyContent="flex-end"
      marginTop={spacing.sm}
      paddingTop={bordered ? spacing.xs : 0}
      borderStyle={bordered ? 'single' : undefined}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderColor="gray"
    >
      {children}
    </Box>
  );
}

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

/**
 * Simple card for quick content grouping
 */
export interface SimpleCardProps {
  title?: string;
  children: ReactNode;
  borderStyle?: BorderStyle;
}

export function SimpleCard({ title, children, borderStyle = 'round' }: SimpleCardProps) {
  return (
    <Card borderStyle={borderStyle}>
      {title && <Card.Header>{title}</Card.Header>}
      <Card.Body>{children}</Card.Body>
    </Card>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

## Usage Example

```typescript
import { Box, Text } from 'ink';
import { Card, SimpleCard } from '../design-system/components/card.js';
import { KeyHint } from '../design-system/components/key-hint.js';

function ReviewResultCard({ title, issues }) {
  return (
    <Card variant="elevated" borderStyle="round">
      <Card.Header bordered>
        {title}
      </Card.Header>
      <Card.Body>
        {issues.map((issue, i) => (
          <Text key={i}>• {issue.message}</Text>
        ))}
      </Card.Body>
      <Card.Footer>
        <KeyHint keys={['Enter']}>Continue</KeyHint>
      </Card.Footer>
    </Card>
  );
}

function QuickCard() {
  return (
    <SimpleCard title="Status">
      <Text color="green">All checks passed!</Text>
    </SimpleCard>
  );
}
```
