# Kanban Board Design System

## Design Direction: "Floating Glass Studio"

The Kanban board follows a "Floating Glass Studio" aesthetic - glass panels that breathe and adapt to their container with subtle depth layering and elegant state transitions.

### Core Principles

1. **Glass Morphism**: Translucent backgrounds with backdrop blur
2. **Fluid Layout**: Components adapt to available space
3. **Responsive First**: Different experiences optimized per viewport
4. **Subtle Depth**: Layered glass panels with soft shadows

---

## Responsive Breakpoints

| Breakpoint | Viewport | Layout Mode | Visible Columns |
|------------|----------|-------------|-----------------|
| Mobile | < 640px | Swipeable carousel with tab pills | 1 |
| Tablet | 640-1023px | Horizontal scroll with peek | 2-3 |
| Desktop | ≥ 1024px | Fluid grid, columns stretch equally | All |

---

## Column Specifications

### Desktop (≥ 1024px)
- **Min Width**: 280px (ensures readable card content)
- **Max Width**: 380px (prevents overly wide cards)
- **Behavior**: Columns flex equally to fill container
- **Gap**: 24px between columns
- **Padding**: 24px container padding

### Tablet (640-1023px)
- **Fixed Width**: 300px per column
- **Behavior**: Horizontal scroll with snap points
- **Peek**: Show 40px of next column as scroll affordance

### Mobile (< 640px)
- **Width**: 100% minus 32px padding (16px each side)
- **Navigation**: Tab pills at top + swipe gestures
- **Behavior**: One column visible at a time

---

## Glass Effect Specifications (Using Existing Tokens)

The design system already has comprehensive glass tokens. Use these instead of hardcoding values:

### Column Container
```css
/* Use existing glass tokens */
background: rgb(var(--color-neutral-background-2) / 0.5);
backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
border: 1px solid rgb(var(--color-neutral-stroke-1) / 0.3);
border-radius: var(--radius-xl);
```

### Active/Drop Target Column
```css
background: rgb(var(--color-brand-background) / 0.05);
border-color: rgb(var(--color-brand-background) / 0.3);
box-shadow:
  0 0 0 2px rgb(var(--color-brand-background) / var(--glow-primary-opacity)),
  0 10px 40px rgb(var(--color-shadow-ambient) / 0.1);
```

### Task Card
```css
background: rgb(var(--color-neutral-background-1) / 0.95);
backdrop-filter: blur(calc(var(--glass-blur) / 4));
border: 1px solid rgb(var(--color-neutral-stroke-1) / 0.5);
box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
```

---

## Animation Specifications (Using Existing Motion Tokens)

### Column Transitions
```css
/* Use motion tokens instead of hardcoded values */
transition:
  flex-basis var(--duration-slower) var(--easing-default),
  max-width var(--duration-slower) var(--easing-default),
  opacity var(--duration-slow) var(--easing-ease-out);
```

### Mobile Swipe
```css
transition: transform var(--duration-slow) var(--easing-ease-out);
```

### Card Hover
```css
transform: translateY(-2px);
transition: all var(--duration-fast) var(--easing-ease-out);
```

### Drag Overlay
```css
transform: rotate(2deg) scale(1.05);
box-shadow: 0 25px 50px rgb(var(--color-brand-background) / var(--glow-primary-opacity));
```

---

## Mobile Tab Pills

### Container
```css
display: flex;
gap: var(--spacing-sm);
padding: var(--spacing-md) var(--spacing-lg);
overflow-x: auto;
scrollbar-width: none; /* Hide scrollbar */
position: sticky;
top: 0;
z-index: 10;
background: rgb(var(--color-neutral-background-1) / 0.9);
backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
border-bottom: 1px solid rgb(var(--color-neutral-stroke-1) / 0.2);
```

### Active Tab
```css
background: rgb(var(--color-brand-background));
color: rgb(var(--color-brand-foreground-on-brand));
box-shadow: 0 4px 12px rgb(var(--color-shadow-ambient) / 0.15);
```

### Inactive Tab
```css
background: rgb(var(--color-neutral-background-3));
color: rgb(var(--color-neutral-foreground-2));
```

---

## Color Tokens Reference

Use these semantic tokens from the design system:

| Token | Purpose |
|-------|---------|
| `--color-neutral-background-1` | Primary surface (cards) |
| `--color-neutral-background-2` | Secondary surface (columns) |
| `--color-neutral-background-3` | Tertiary surface (inactive tabs) |
| `--color-neutral-foreground-1` | Primary text |
| `--color-neutral-foreground-2` | Secondary text |
| `--color-neutral-stroke-1` | Borders |
| `--color-brand-background` | Accent/active states |
| `--color-brand-foreground-1` | Text on brand background |

### Glass Tokens (Use These!)
| Token | Value |
|-------|-------|
| `--glass-blur` | 16px |
| `--glass-saturation` | 180% |
| `--glass-bg-opacity` | 0.85 (light), 0.75 (dark) |
| `--glow-primary-opacity` | 0.15 (light), 0.25 (dark) |

---

## Motion Tokens (Use These!)
| Token | Value |
|-------|-------|
| `--duration-slower` | 400ms |
| `--duration-slow` | 300ms |
| `--duration-fast` | 150ms |
| `--easing-default` | cubic-bezier(0.4, 0, 0.2, 1) |
| `--easing-ease-out` | cubic-bezier(0, 0, 0.2, 1) |

---

## Accessibility Requirements

1. **Reduced Motion**: Respect `prefers-reduced-motion` media query
2. **Focus States**: Visible focus rings on all interactive elements
3. **Touch Targets**: Minimum 44x44px for mobile tap targets
4. **Contrast**: Maintain WCAG AA contrast ratios
5. **ARIA Attributes**:
   - Tab container: `role="tablist"`
   - Tab buttons: `role="tab"`, `aria-selected`, `aria-controls`
   - Swipeable container: `aria-live="polite"` for column changes
6. **Keyboard Navigation**:
   - Arrow keys (Left/Right) to switch between columns on mobile
   - Tab/Shift+Tab for normal navigation
