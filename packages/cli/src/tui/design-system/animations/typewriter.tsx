/**
 * Stargazer CLI Design System - Typewriter Animation
 *
 * Character-by-character text reveal effect.
 * Used for logo intro and dramatic text reveals.
 *
 * @example
 * ```typescript
 * import { Typewriter } from './typewriter.js';
 *
 * <Typewriter
 *   text="★ STARGAZER"
 *   palette="stellar"
 *   onComplete={() => console.log('Done!')}
 * />
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { Text } from 'ink';
import { gradientLine } from '../gradient.js';
import { typewriterConfig } from '../tokens/motion.js';
import type { PaletteName } from '../palettes.js';

export interface TypewriterProps {
  /** Text to reveal */
  text: string;
  /** Milliseconds per character */
  speed?: number;
  /** Color palette for gradient */
  palette?: PaletteName;
  /** Apply bold styling */
  bold?: boolean;
  /** Pause longer after punctuation */
  punctuationPause?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Start animation immediately (default: true) */
  autoStart?: boolean;
}

const PUNCTUATION = new Set(['.', ',', '!', '?', ':', ';']);

/**
 * Typewriter Component
 *
 * Reveals text one character at a time with optional gradient.
 */
export function Typewriter({
  text,
  speed = typewriterConfig.charInterval,
  palette,
  bold = false,
  punctuationPause = true,
  onComplete,
  autoStart = true,
}: TypewriterProps) {
  const [displayedLength, setDisplayedLength] = useState(autoStart ? 0 : text.length);
  const [isComplete, setIsComplete] = useState(!autoStart);

  useEffect(() => {
    if (!autoStart || isComplete) return;

    if (displayedLength >= text.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const currentChar = text.charAt(displayedLength);
    const isPunctuation = PUNCTUATION.has(currentChar);
    const delay = punctuationPause && isPunctuation
      ? typewriterConfig.punctuationPause
      : speed;

    const timer = setTimeout(() => {
      setDisplayedLength((len) => len + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [displayedLength, text, speed, punctuationPause, onComplete, autoStart, isComplete]);

  const displayedText = text.slice(0, displayedLength);

  if (palette) {
    return <Text>{gradientLine(displayedText, { palette, bold })}</Text>;
  }

  return <Text bold={bold}>{displayedText}</Text>;
}

/**
 * Hook to use typewriter effect manually
 *
 * @returns [displayedText, isComplete, reset]
 */
export function useTypewriter(
  text: string,
  options: Omit<TypewriterProps, 'text' | 'onComplete'> = {}
): [string, boolean, () => void] {
  const {
    speed = typewriterConfig.charInterval,
    punctuationPause = true,
    autoStart = true,
  } = options;

  const [displayedLength, setDisplayedLength] = useState(autoStart ? 0 : text.length);
  const [isComplete, setIsComplete] = useState(!autoStart);

  const reset = useCallback(() => {
    setDisplayedLength(0);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (!autoStart || isComplete) return;

    if (displayedLength >= text.length) {
      setIsComplete(true);
      return;
    }

    const currentChar = text.charAt(displayedLength);
    const isPunctuation = PUNCTUATION.has(currentChar);
    const delay = punctuationPause && isPunctuation
      ? typewriterConfig.punctuationPause
      : speed;

    const timer = setTimeout(() => {
      setDisplayedLength((len) => len + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [displayedLength, text, speed, punctuationPause, autoStart, isComplete]);

  return [text.slice(0, displayedLength), isComplete, reset];
}

/**
 * Multi-line typewriter for ASCII art
 *
 * Reveals multiple lines with staggered timing
 */
export interface MultiLineTypewriterProps {
  /** Multi-line text (string with \n or array) */
  lines: string | string[];
  /** Ms per character */
  speed?: number;
  /** Delay between lines */
  lineDelay?: number;
  /** Color palette */
  palette?: PaletteName;
  /** Callback on complete */
  onComplete?: () => void;
}

export function MultiLineTypewriter({
  lines,
  speed = typewriterConfig.charInterval,
  lineDelay = 100,
  palette,
  onComplete,
}: MultiLineTypewriterProps) {
  const linesArray = typeof lines === 'string' ? lines.split('\n') : lines;
  const [currentLine, setCurrentLine] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);

  const handleLineComplete = useCallback(() => {
    const currentLineText = linesArray[currentLine];
    if (!currentLineText) {
      onComplete?.();
      return;
    }
    setCompletedLines((prev) => [...prev, currentLineText]);

    if (currentLine < linesArray.length - 1) {
      setTimeout(() => {
        setCurrentLine((line) => line + 1);
      }, lineDelay);
    } else {
      onComplete?.();
    }
  }, [currentLine, linesArray, lineDelay, onComplete]);

  return (
    <Text>
      {completedLines.map((line, i) => (
        <Text key={i}>
          {palette ? gradientLine(line, { palette }) : line}
          {'\n'}
        </Text>
      ))}
      {currentLine < linesArray.length && linesArray[currentLine] && (
        <Typewriter
          text={linesArray[currentLine] ?? ''}
          speed={speed}
          palette={palette}
          onComplete={handleLineComplete}
        />
      )}
    </Text>
  );
}
