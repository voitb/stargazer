# STARGAZER CLI Design System

> A premium, Apple/Stripe-inspired design system for terminal interfaces.
> Built with Ink (React for CLI) and inspired by Claude Code & Gemini CLI.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [File Structure](#file-structure)
3. [Design Tokens](#design-tokens)
4. [Color System](#color-system)
5. [Typography](#typography)
6. [Spacing](#spacing)
7. [Borders & Surfaces](#borders--surfaces)
8. [Animation System](#animation-system)
9. [Logo System](#logo-system)
10. [Component Library](#component-library)
11. [Theme Support](#theme-support)
12. [Responsive Design](#responsive-design)
13. [Implementation Tasks](#implementation-tasks)

---

## Design Philosophy

### Core Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| **Minimalist** | Only essential elements, no clutter | Single-purpose components |
| **Premium Feel** | Apple/Stripe-inspired polish | Subtle gradients, generous spacing |
| **Purposeful Motion** | Animation guides attention | Loading states, confirmations |
| **Theme-Aware** | Works on dark and light terminals | Automatic palette switching |
| **Accessible** | 4.5:1 contrast ratios minimum | WCAG AA compliant colors |

### Visual Identity

```
STARGAZER uses a star/celestial theme:
- Star icons: ✦ ✧ ★ ☆
- Diamond icons: ◇ ◈
- Circle icons: ○ ◌

Primary gradient: Cool blue-white (starlight)
Secondary gradient: Silver-gray (moonlight)
```

---

## File Structure

```
apps/cli/src/tui/
├── theme/
│   ├── index.ts             # Theme exports
│   ├── palettes.ts          # Palette definitions
│   ├── gradient.ts          # Gradient text rendering
│   ├── provider.tsx         # Theme context & detection
│   └── tokens/
│       ├── index.ts         # Token exports
│       ├── colors.ts        # Color palettes & semantic colors
│       ├── spacing.ts       # Spacing scale (xs → xl)
│       ├── typography.ts    # Text styles & weights
│       ├── borders.ts       # Border styles & patterns
│       └── motion.ts        # Animation durations & easings
│
├── components/
│   ├── index.ts
│   ├── branding/
│   │   ├── animated-logo.tsx
│   │   ├── ascii-logo.ts
│   │   ├── logo-component.tsx
│   │   └── responsive.ts
│   ├── feedback/
│   │   ├── badge.tsx
│   │   ├── progress-bar.tsx
│   │   ├── star-spinner.tsx # ✦→✧→☆→★ rotation
│   │   ├── status-text.tsx
│   │   └── toast.tsx
│   ├── forms/
│   │   ├── input-field.tsx
│   │   └── select-with-arrows.tsx
│   └── display/
│       ├── card.tsx         # Elevated surface container
│   ├── divider.tsx          # Themed separators
│   ├── badge.tsx            # Status indicators
│   ├── key-hint.tsx         # Keyboard shortcut display
│   └── toast.tsx            # Notification component
│
└── utils/
    ├── index.ts
    ├── detect-theme.ts      # Auto dark/light detection
    └── terminal-size.ts     # Responsive utilities
```

---

## Design Tokens

### Token Categories

| Category | Purpose | Example Values |
|----------|---------|----------------|
| `colors` | All color definitions | `colors.brand.primary`, `colors.semantic.error` |
| `spacing` | Consistent spacing | `spacing.sm` (2), `spacing.lg` (8) |
| `typography` | Text styling | `typography.title`, `typography.caption` |
| `borders` | Border patterns | `borders.style.star`, `borders.radius.round` |
| `motion` | Animation timing | `motion.duration.fast`, `motion.easing.smooth` |

### Using Tokens

```typescript
import { tokens } from '../theme/index.js';

// Colors
const primaryColor = tokens.colors.brand.primary; // 'stellar' palette

// Spacing
const padding = tokens.spacing.md; // 4 characters

// Typography
const titleStyle = tokens.typography.title; // { bold: true, size: 'large' }

// Motion
const duration = tokens.motion.duration.normal; // 200ms
```

---

## Color System

### Brand Palettes

#### Dark Theme

| Palette | Hex Values | RGB Gradient | Use Case |
|---------|------------|--------------|----------|
| `stellar` | #f0f9ff → #bae6fd → #7dd3fc | White → Ice → Cyan | Logo, highlights, active states |
| `moonlight` | #94a3b8 → #cbd5e1 → #e2e8f0 | Slate → Silver → Gray | Labels, borders, secondary |

#### Light Theme

| Palette | Hex Values | RGB Gradient | Use Case |
|---------|------------|--------------|----------|
| `daylight` | #1e3a5f → #2563eb → #3b82f6 | Navy → Royal → Bright | Logo, highlights (inverted) |
| `dusk` | #475569 → #64748b → #94a3b8 | Dark Slate → Slate → Light | Labels, borders (inverted) |

### Semantic Colors

| Token | Dark | Light | Use Case |
|-------|------|-------|----------|
| `success` | #86efac → #22c55e | Same | Completed states, confirmations |
| `warning` | #fde68a → #f59e0b | Same | Caution states, pending |
| `error` | #fca5a5 → #ef4444 | Same | Error states, destructive |

### Surface Colors

| Token | Dark | Light | Use Case |
|-------|------|-------|----------|
| `surface.base` | transparent | transparent | Default background |
| `surface.elevated` | #1e293b | #f8fafc | Cards, panels |
| `surface.overlay` | #0f172a/80 | #ffffff/80 | Modal backgrounds |

### Text Colors

| Token | Dark | Light | Use Case |
|-------|------|-------|----------|
| `text.primary` | #f8fafc | #0f172a | Main content |
| `text.secondary` | #94a3b8 | #64748b | Dimmed text |
| `text.muted` | #475569 | #cbd5e1 | Hints, placeholders |
| `text.inverse` | #0f172a | #f8fafc | On colored backgrounds |

---

## Typography

### Scale

| Token | Bold | Style | Use Case |
|-------|------|-------|----------|
| `typography.title` | Yes | Normal | Screen headers, logo |
| `typography.heading` | Yes | Normal | Section headers |
| `typography.body` | No | Normal | Main content |
| `typography.caption` | No | Dim | Labels, hints |
| `typography.code` | No | Normal | Code snippets |

### Implementation

```typescript
export const typography = {
  title: { bold: true },
  heading: { bold: true },
  body: { bold: false },
  caption: { bold: false, dimColor: true },
  code: { bold: false },
} as const;
```

---

## Spacing

### Scale

| Token | Characters | Use Case |
|-------|------------|----------|
| `spacing.xs` | 1 | Tight gaps |
| `spacing.sm` | 2 | Inline elements |
| `spacing.md` | 4 | Standard padding |
| `spacing.lg` | 8 | Section separation |
| `spacing.xl` | 16 | Major sections |

### Implementation

```typescript
export const spacing = {
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
} as const;
```

---

## Borders & Surfaces

### Border Styles

| Style | Characters | Example |
|-------|------------|---------|
| `none` | - | No border |
| `single` | `─│┌┐└┘` | Standard box |
| `double` | `═║╔╗╚╝` | Emphasized box |
| `round` | `─│╭╮╰╯` | Soft corners |
| `star` | `✦───✦` | Star-themed divider |
| `dots` | `·····` | Subtle separator |

### Star Divider Patterns

```
✦────────────────────────────────────✦  (full)
✦──────────────✦  (medium)
✦─────✦  (short)
···············  (dots)
```

### Card Surfaces

```typescript
// Elevated card
<Box
  borderStyle="round"
  borderColor={tokens.colors.border.subtle}
  padding={tokens.spacing.md}
>
  {children}
</Box>
```

---

## Animation System

### Timing

| Token | Duration | Use Case |
|-------|----------|----------|
| `motion.duration.instant` | 0ms | No animation |
| `motion.duration.fast` | 100ms | Micro-interactions |
| `motion.duration.normal` | 200ms | Standard transitions |
| `motion.duration.slow` | 400ms | Emphasis, large moves |

### Easing

| Token | Curve | Use Case |
|-------|-------|----------|
| `motion.easing.linear` | Linear | Progress bars |
| `motion.easing.smooth` | ease-out | Entrances |
| `motion.easing.bounce` | ease-in-out | Playful elements |

### Animation Components

#### StarSpinner

```
Frame sequence: ✦ → ✧ → ☆ → ★ → ✦
Interval: 100ms per frame
```

```typescript
import { StarSpinner } from '../components/feedback/star-spinner.js';

<StarSpinner palette="stellar" />
```

## Logo System

### Logo Variants

| Variant | Min Width | Characters |
|---------|-----------|------------|
| `full` | 80 cols | Star-decorated ASCII art |
| `medium` | 60 cols | Plain ASCII art |
| `compact` | 40 cols | `★ STARGAZER` |
| `minimal` | Any | `✦` |

### ASCII Art Definitions

```
FULL (with stars):
  ✦ ╔═╗╔╦╗╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╦═╗ ✦
 ✧  ╚═╗ ║ ╠═╣╠╦╝║ ╦╠═╣╔═╝║╣ ╠╦╝  ✧
  ✦ ╚═╝ ╩ ╩ ╩╩╚═╚═╝╩ ╩╚═╝╚═╝╩╚═ ✦

MEDIUM (no stars):
╔═╗╔╦╗╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╦═╗
╚═╗ ║ ╠═╣╠╦╝║ ╦╠═╣╔═╝║╣ ╠╦╝
╚═╝ ╩ ╩ ╩╩╚═╚═╝╩ ╩╚═╝╚═╝╩╚═

COMPACT:
★ STARGAZER

MINIMAL:
✦
```

### Responsive Logo Hook

```typescript
import { useResponsiveLogo } from '../components/branding/responsive.js';

function Header() {
  const logoVariant = useResponsiveLogo();
  // Returns: 'full' | 'medium' | 'compact' | 'minimal'

  return <Logo variant={logoVariant} palette="stellar" />;
}
```

### Animated Intro

```typescript
import { AnimatedLogo } from '../components/branding/animated-logo.js';

// Typewriter effect on startup
<AnimatedLogo
  variant="full"
  palette="stellar"
  skipAnimation={false}
  onComplete={() => console.log('Intro complete')}
/>
```

---

## Component Library

### Card

```typescript
interface CardProps {
  variant?: 'default' | 'elevated';
  borderStyle?: 'single' | 'round' | 'star';
  padding?: keyof typeof spacing;
  children: React.ReactNode;
}

<Card variant="elevated" borderStyle="round" padding="md">
  <Card.Header>
    <Text bold>Title</Text>
  </Card.Header>
  <Card.Body>
    Content here
  </Card.Body>
  <Card.Footer>
    <KeyHint keys={['Enter']}>Confirm</KeyHint>
  </Card.Footer>
</Card>
```

### Divider

```typescript
interface DividerProps {
  variant?: 'line' | 'star' | 'dots';
  width?: number | '100%';
}

<Divider variant="star" />
// Output: ✦────────────────────────────────────✦

<Divider variant="dots" />
// Output: ···································
```

### Badge

```typescript
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

<Badge variant="success">✦ Complete</Badge>
<Badge variant="warning">✧ In Progress</Badge>
<Badge variant="error">○ Failed</Badge>
```

### KeyHint

```typescript
interface KeyHintProps {
  keys: string[];
  children?: React.ReactNode;
}

<KeyHint keys={['ESC']}>Go back</KeyHint>
// Output: [ESC] Go back

<KeyHint keys={['⌘', 'K']}>Command palette</KeyHint>
// Output: [⌘+K] Command palette
```

### Toast

```typescript
interface ToastProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onDismiss?: () => void;
  children: React.ReactNode;
}

<Toast variant="success" duration={3000}>
  Review complete!
</Toast>
```

---

## Theme Support

### Auto-Detection

```typescript
import { ThemeProvider } from '../theme/index.js';
import { detectTheme } from '../theme/provider.js';

// Auto-detect from terminal environment
const theme = detectTheme(); // 'dark' | 'light'

// Use in app
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

### Detection Logic

```typescript
function detectTheme(): 'dark' | 'light' {
  // 1. Check STARGAZER_THEME env var
  if (process.env.STARGAZER_THEME) {
    return process.env.STARGAZER_THEME as 'dark' | 'light';
  }

  // 2. Check COLORFGBG (format: "fg;bg")
  const colorfgbg = process.env.COLORFGBG;
  if (colorfgbg) {
    const [, bg] = colorfgbg.split(';');
    const bgColor = parseInt(bg, 10);
    // High values = light background
    return bgColor > 8 ? 'light' : 'dark';
  }

  // 3. Default to dark (most common)
  return 'dark';
}
```

### Theme Hook

```typescript
import { useTheme } from '../theme/index.js';

function MyComponent() {
  const { theme, palette, colors } = useTheme();

  // theme: 'dark' | 'light'
  // palette: { primary: 'stellar'|'daylight', secondary: 'moonlight'|'dusk' }
  // colors: resolved color tokens for current theme
}
```

---

## Responsive Design

### Terminal Width Breakpoints

| Breakpoint | Min Width | Logo | Layout |
|------------|-----------|------|--------|
| `xl` | 120 cols | Full + tagline | Full layout |
| `lg` | 80 cols | Full | Standard layout |
| `md` | 60 cols | Medium | Compact layout |
| `sm` | 40 cols | Compact | Minimal layout |
| `xs` | < 40 cols | Minimal | Icon only |

### Responsive Hook

```typescript
import { useTerminalSize, useBreakpoint } from '../components/branding/responsive.js';

function ResponsiveComponent() {
  const { columns, rows } = useTerminalSize();
  const breakpoint = useBreakpoint(); // 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  return (
    <Box width={columns > 80 ? '80%' : '100%'}>
      {breakpoint !== 'xs' && <Header />}
      <Content />
    </Box>
  );
}
```

---

## Implementation Tasks

### Phase 1: Foundation (Tokens)

| Task | File | Description |
|------|------|-------------|
| task-129 | `theme/tokens/spacing.ts` | Spacing scale (xs→xl) |
| task-130 | `theme/tokens/typography.ts` | Typography tokens |
| task-131 | `theme/tokens/borders.ts` | Border styles & patterns |
| task-133 | `theme/tokens/motion.ts` | Animation timing tokens |

### Phase 2: Color Enhancement

| Task | File | Description |
|------|------|-------------|
| task-134 | `theme/tokens/colors.ts` | Enhanced color system |
| task-135 | `theme/provider.tsx` | Theme context |

### Phase 3: Animations

| Task | File | Description |
|------|------|-------------|
| task-136 | `components/feedback/star-spinner.tsx` | Star rotation spinner |

### Phase 4: Logo System

| Task | File | Description |
|------|------|-------------|
| task-139 | `components/branding/responsive.ts` | Width detection |
| task-140 | `components/branding/logo-component.tsx` | Responsive logo component |
| task-141 | `components/branding/animated-logo.tsx` | Animated logo intro |

### Phase 5: Components

| Task | File | Description |
|------|------|-------------|
| task-142 | `components/display/card.tsx` | Card component |
| task-143 | `components/display/divider.tsx` | Divider component |
| task-144 | `components/feedback/badge.tsx` | Badge component |
| task-145 | `components/display/key-hint.tsx` | KeyHint component |
| task-146 | `components/feedback/toast.tsx` | Toast component |

### Phase 6: Utils & Integration

| Task | File | Description |
|------|------|-------------|
| task-147 | `utils/detect-theme.ts` | Theme auto-detection |
| task-148 | `utils/terminal-size.ts` | Responsive utilities |
| task-149 | Update `index.ts` | Export all new modules |
| task-150 | Update components | Apply design system |

---

## References

### Inspiration

- [Claude Code](https://github.com/anthropics/claude-code) - Filled ASCII art, gradient logos
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Responsive logos, smooth rendering
- [oh-my-logo](https://github.com/shinshin86/oh-my-logo) - ASCII logo generator
- [Ink](https://github.com/vadimdemedes/ink) - React for CLI

### Color Resources

- [terminal.sexy](https://terminal.sexy/) - Terminal color scheme designer
- [Gogh](https://gogh-co.github.io/Gogh/) - Terminal color scheme collection
- [Better CLI Colors](https://bettercli.org/design/using-colors-in-cli/) - CLI color best practices

### Design Patterns

- Apple Human Interface Guidelines (minimalism, clarity)
- Stripe Dashboard (subtle gradients, premium feel)
- Gruvbox color scheme (warm, readable)
