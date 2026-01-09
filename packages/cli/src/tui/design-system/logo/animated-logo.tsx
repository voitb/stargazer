/**
 * Stargazer CLI Design System - Animated Logo
 *
 * Logo with typewriter intro animation.
 * Creates premium first impression during CLI startup.
 *
 * @example
 * ```typescript
 * import { AnimatedLogo } from './animated-logo.js';
 *
 * <AnimatedLogo
 *   palette="stellar"
 *   onComplete={() => setShowContent(true)}
 * />
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { Box, Text } from 'ink';
import { gradientLine } from '../gradient.js';
import { STAR_LOGO, SLIM_LOGO } from '../ascii-logo.js';
import { STAR_ICONS } from '../palettes.js';
import { typewriterConfig } from '../tokens/motion.js';
import { useResponsiveLogo, type LogoVariant } from './responsive.js';
import type { PaletteName } from '../palettes.js';

export interface AnimatedLogoProps {
  /** Force a specific variant */
  variant?: LogoVariant;
  /** Color palette */
  palette?: PaletteName;
  /** Speed in ms per character */
  speed?: number;
  /** Delay between lines in ms */
  lineDelay?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Skip animation and show final state */
  skipAnimation?: boolean;
}

interface LineState {
  text: string;
  displayedLength: number;
  isComplete: boolean;
}

/**
 * Animated Logo Component
 *
 * Reveals the logo with a typewriter effect, line by line.
 */
export function AnimatedLogo({
  variant: variantProp,
  palette = 'stellar',
  speed = typewriterConfig.charInterval,
  lineDelay = 50,
  onComplete,
  skipAnimation = false,
}: AnimatedLogoProps) {
  const responsiveVariant = useResponsiveLogo();
  const variant = variantProp ?? responsiveVariant;

  // Get logo text based on variant
  const getLogoText = useCallback((): string => {
    switch (variant) {
      case 'full':
        return STAR_LOGO;
      case 'medium':
        return SLIM_LOGO;
      case 'compact':
        return `${STAR_ICONS.star} STARGAZER`;
      case 'minimal':
        return STAR_ICONS.filled;
    }
  }, [variant]);

  const logoText = getLogoText();
  const lines = logoText.split('\n');

  // Skip animation - show final state
  if (skipAnimation) {
    return (
      <Box flexDirection="column" alignItems="center">
        {lines.map((line, index) => (
          <Text key={index}>
            {gradientLine(line, { palette })}
          </Text>
        ))}
      </Box>
    );
  }

  return (
    <AnimatedLines
      lines={lines}
      palette={palette}
      speed={speed}
      lineDelay={lineDelay}
      onComplete={onComplete}
    />
  );
}

interface AnimatedLinesProps {
  lines: string[];
  palette: PaletteName;
  speed: number;
  lineDelay: number;
  onComplete?: () => void;
}

function AnimatedLines({
  lines,
  palette,
  speed,
  lineDelay,
  onComplete,
}: AnimatedLinesProps) {
  const [lineStates, setLineStates] = useState<LineState[]>(() =>
    lines.map((text) => ({
      text,
      displayedLength: 0,
      isComplete: false,
    }))
  );
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (animationComplete) return;

    // All lines complete?
    if (currentLineIndex >= lines.length) {
      setAnimationComplete(true);
      onComplete?.();
      return;
    }

    const currentLine = lineStates[currentLineIndex];
    if (!currentLine) {
      return;
    }

    // Current line complete? Move to next
    if (currentLine.isComplete) {
      const timer = setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
      }, lineDelay);
      return () => clearTimeout(timer);
    }

    // Reveal next character
    if (currentLine.displayedLength < currentLine.text.length) {
      const timer = setTimeout(() => {
        setLineStates((states) =>
          states.map((state, i) => {
            if (i !== currentLineIndex) return state;
            const newLength = state.displayedLength + 1;
            return {
              ...state,
              displayedLength: newLength,
              isComplete: newLength >= state.text.length,
            };
          })
        );
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [
    lineStates,
    currentLineIndex,
    lines.length,
    speed,
    lineDelay,
    onComplete,
    animationComplete,
  ]);

  return (
    <Box flexDirection="column" alignItems="center">
      {lineStates.map((state, index) => {
        // Only show lines that have started animating
        if (index > currentLineIndex) {
          return <Text key={index}> </Text>;
        }

        const displayedText = state.text.slice(0, state.displayedLength);

        return (
          <Text key={index}>
            {gradientLine(displayedText, { palette })}
          </Text>
        );
      })}
    </Box>
  );
}

/**
 * Hook to control animated intro sequence
 */
export function useAnimatedIntro(options: {
  duration?: number;
  onComplete?: () => void;
} = {}) {
  const { duration = 2000, onComplete } = options;
  const [isAnimating, setIsAnimating] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = useCallback(() => {
    setIsAnimating(false);
    setIsComplete(true);
    onComplete?.();
  }, [onComplete]);

  const skip = useCallback(() => {
    setIsAnimating(false);
    setIsComplete(true);
    onComplete?.();
  }, [onComplete]);

  return {
    isAnimating,
    isComplete,
    onComplete: handleComplete,
    skip,
  };
}
