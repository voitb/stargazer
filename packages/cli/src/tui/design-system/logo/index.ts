/**
 * Stargazer CLI Design System - Logo Barrel
 */

export {
  breakpoints,
  getBreakpoint,
  getLogoVariant,
  useTerminalSize,
  useBreakpoint,
  useResponsiveLogo,
  useMediaQuery,
  useShouldShowTagline,
  type Breakpoint,
  type LogoVariant,
  type TerminalSize,
} from './responsive.js';

export {
  Logo,
  StarIcon,
  BrandMark,
  type LogoProps,
  type BrandMarkProps,
} from './logo-component.js';

export {
  AnimatedLogo,
  useAnimatedIntro,
  type AnimatedLogoProps,
} from './animated-logo.js';
