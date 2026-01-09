/**
 * Stargazer CLI Design System - Responsive Logo Component
 *
 * React component that renders the logo with automatic responsive sizing.
 *
 * @example
 * ```typescript
 * import { Logo } from './logo-component.js';
 *
 * // Auto-responsive
 * <Logo palette="stellar" />
 *
 * // Fixed variant
 * <Logo variant="compact" palette="stellar" />
 * ```
 */

import { Box, Text } from 'ink';
import { gradientText, gradientLine } from '../gradient.js';
import { STAR_LOGO, SLIM_LOGO } from '../ascii-logo.js';
import { STAR_ICONS } from '../palettes.js';
import {
  useResponsiveLogo,
  useShouldShowTagline,
  type LogoVariant,
} from './responsive.js';
import type { PaletteName, GradientDirection } from '../index.js';

export interface LogoProps {
  /** Force a specific variant (bypasses responsive) */
  variant?: LogoVariant;
  /** Color palette */
  palette?: PaletteName;
  /** Gradient direction */
  direction?: GradientDirection;
  /** Optional tagline (shown on xl terminals) */
  tagline?: string;
  /** Optional version string */
  version?: string;
  /** Show version below logo */
  showVersion?: boolean;
  /** Center the logo horizontally */
  centered?: boolean;
}

/**
 * Responsive Logo Component
 *
 * Automatically selects the appropriate logo variant based on terminal width.
 * Can be overridden with the variant prop.
 */
export function Logo({
  variant: variantProp,
  palette = 'stellar',
  direction = 'horizontal',
  tagline,
  version,
  showVersion = false,
  centered = true,
}: LogoProps) {
  const responsiveVariant = useResponsiveLogo();
  const shouldShowTagline = useShouldShowTagline();

  const variant = variantProp ?? responsiveVariant;

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'full':
        return (
          <Text>
            {gradientText(STAR_LOGO, { palette, direction })}
          </Text>
        );

      case 'medium':
        return (
          <Text>
            {gradientText(SLIM_LOGO, { palette, direction })}
          </Text>
        );

      case 'compact':
        return (
          <Text>
            {gradientLine(`${STAR_ICONS.star} STARGAZER`, { palette, bold: true })}
          </Text>
        );

      case 'minimal':
        return (
          <Text>
            {gradientLine(STAR_ICONS.filled, { palette })}
          </Text>
        );
    }
  };

  // Only show tagline on full variant when terminal is wide enough
  const showTaglineNow = tagline && (variant === 'full') && shouldShowTagline;

  return (
    <Box
      flexDirection="column"
      alignItems={centered ? 'center' : 'flex-start'}
    >
      {renderContent()}

      {showTaglineNow && (
        <Box marginTop={1}>
          <Text dimColor>{tagline}</Text>
        </Box>
      )}

      {showVersion && version && (
        <Box marginTop={showTaglineNow ? 0 : 1}>
          <Text dimColor>
            {gradientLine(`⌬ v${version}`, { palette })}
          </Text>
        </Box>
      )}
    </Box>
  );
}

/**
 * Minimal star icon component
 *
 * Just the star icon with gradient - for use in tight spaces
 */
export function StarIcon({ palette = 'stellar' }: { palette?: PaletteName }) {
  return <Text>{gradientLine(STAR_ICONS.filled, { palette })}</Text>;
}

/**
 * Compact brand mark
 *
 * Star icon + text on single line
 */
export interface BrandMarkProps {
  palette?: PaletteName;
  showText?: boolean;
}

export function BrandMark({ palette = 'stellar', showText = true }: BrandMarkProps) {
  if (!showText) {
    return <StarIcon palette={palette} />;
  }

  return (
    <Text>
      {gradientLine(`${STAR_ICONS.filled} STARGAZER`, { palette, bold: true })}
    </Text>
  );
}
