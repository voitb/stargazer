import { Box } from 'ink';
import { Logo, Divider } from '../index.js';
import { useTheme } from '../../theme/index.js';

interface HeaderProps {
  projectName: string;
}

/**
 * Application header with star-themed gradient branding
 *
 * Uses the responsive Logo component from the design system which
 * automatically selects the appropriate logo variant based on terminal width.
 * Theme-aware: uses stellar/daylight palette based on terminal theme.
 *
 * Following CLI_ARCHITECTURE.md layout component guidelines.
 */
export function Header({ projectName }: HeaderProps) {
  const { primaryPalette } = useTheme();

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Logo palette={primaryPalette} />
      <Box marginTop={1}>
        <Divider variant="star" label={projectName} palette={primaryPalette} />
      </Box>
    </Box>
  );
}

/**
 * Compact header - single line with star icon and project name
 * For screens where space is limited
 */
export function CompactHeader({ projectName }: HeaderProps) {
  const { primaryPalette, secondaryPalette } = useTheme();

  return (
    <Box flexDirection="row" gap={1} paddingX={1} alignItems="center">
      <Logo variant="compact" palette={primaryPalette} centered={false} />
      <Divider variant="dots" width={3} dimmed />
      <Divider variant="star" label={projectName} palette={secondaryPalette} width={30} />
    </Box>
  );
}

/**
 * Minimal header - just the star brand
 * For very constrained displays
 */
export function MinimalHeader() {
  const { primaryPalette } = useTheme();
  return <Logo variant="minimal" palette={primaryPalette} centered={false} />;
}
