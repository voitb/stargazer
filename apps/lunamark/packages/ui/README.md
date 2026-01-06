# @ui - Lunamark Design System

A Fluent 2-inspired design system with glassmorphism aesthetics, built for the Lunamark kanban application.

## Features

- **Two-layer token architecture** following Microsoft Fluent 2 patterns
- **Light & dark themes** with system preference detection
- **13 production-ready components** with CVA variants
- **Glass morphism effects** as signature visual style
- **Full accessibility** with focus management and keyboard navigation

## Quick Start

### 1. Import CSS in your app entry

```tsx
// src/main.tsx or app entry
import "@ui/styles/tokens.css";
import "@ui/styles/animations.css";
```

### 2. Use components

```tsx
import { Button, Dialog, Badge } from "@ui/components";
import { useTheme } from "@ui/hooks";

function App() {
  const { theme, setTheme } = useTheme();

  return (
    <Button variant="primary" size="md">
      Click me
    </Button>
  );
}
```

## Components

| Component | Description |
|-----------|-------------|
| Button | Primary, secondary, outline, ghost, danger, link variants |
| Badge | Status indicators with color variants |
| Avatar | User avatars with group and selectable variants |
| Card | Container component |
| Dialog | Modal with compound sub-components |
| Input | Text input with variants |
| Textarea | Multi-line input |
| Select | Native select dropdown |
| Toggle | Toggle switch |
| ToggleGroup | Grouped toggle buttons with single/multiple selection |
| Checkbox | Checkbox input |
| Tooltip | Hover tooltips |

## Token Usage

All colors use RGB space format. Always wrap in `rgb()`:

```tsx
// Correct
className="bg-[rgb(var(--color-brand-background))]"
className="bg-[rgb(var(--color-neutral-background-2)/0.8)]"  // with opacity

// Wrong
className="bg-[var(--color-brand-background)]"  // missing rgb()
className="bg-blue-600"  // hardcoded, breaks theming
```

## Documentation

For detailed documentation including:
- Full token reference
- Component patterns
- Extension guides
- Design decisions

See **[CLAUDE.md](./CLAUDE.md)** - comprehensive documentation optimized for both AI and human developers.

## File Structure

```
packages/ui/
├── components/      # 13 React components
├── hooks/           # useTheme, useExitAnimation, useFocusTrap, useControllableState
├── tokens/          # Two-layer token system
│   ├── global/      # Raw values (colors, typography, spacing, radius, motion)
│   ├── alias/       # Semantic tokens
│   └── themes/      # Light/dark theme mappings
├── styles/          # CSS output
└── utils/           # cn() helper
```

## Theme Switching

```tsx
import { useTheme } from "@ui/hooks";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle theme
    </button>
  );
}
```

The theme is persisted to localStorage and respects system preferences when set to `"system"`.
