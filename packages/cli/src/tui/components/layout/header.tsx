import { Box } from 'ink';
import { Logo, Divider } from '../../design-system/index.js';

interface HeaderProps {
  projectName: string;
}

/**
 * Application header with star-themed gradient branding
 *
 * Uses the responsive Logo component from the design system which
 * automatically selects the appropriate logo variant based on terminal width.
 * Uses the "stellar" palette for a cool, bright starlight effect.
 *
 * Following CLI_ARCHITECTURE.md layout component guidelines.
 */
export function Header({ projectName }: HeaderProps) {
  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Logo palette="stellar" />
      <Box marginTop={1}>
        <Divider variant="star" label={projectName} palette="stellar" />
      </Box>
    </Box>
  );
}

/**
 * Compact header - single line with star icon and project name
 * For screens where space is limited
 */
export function CompactHeader({ projectName }: HeaderProps) {
  return (
    <Box flexDirection="row" gap={1} paddingX={1} alignItems="center">
      <Logo variant="compact" palette="stellar" centered={false} />
      <Divider variant="dots" width={3} dimmed />
      <Divider variant="star" label={projectName} palette="moonlight" width={30} />
    </Box>
  );
}

/**
 * Minimal header - just the star brand
 * For very constrained displays
 */
export function MinimalHeader() {
  return <Logo variant="minimal" palette="stellar" centered={false} />;
}
