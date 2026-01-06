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

## Glass Effect Specifications

### Column Container
```css
background: rgb(var(--color-neutral-background-2) / 0.5);
backdrop-filter: blur(8px);
border: 1px solid rgb(var(--color-neutral-stroke-1) / 0.3);
border-radius: 12px;
```

### Active/Drop Target Column
```css
background: rgb(var(--color-brand-background) / 0.05);
border-color: rgb(var(--color-brand-background) / 0.3);
box-shadow:
  0 0 0 2px rgb(var(--color-brand-background) / 0.15),
  0 10px 40px rgb(0 0 0 / 0.1);
```

### Task Card
```css
background: rgb(var(--color-neutral-background-1) / 0.95);
backdrop-filter: blur(4px);
border: 1px solid rgb(var(--color-neutral-stroke-1) / 0.5);
box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
```

---

## Animation Specifications

### Column Transitions
```css
transition:
  flex-basis 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
  max-width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
  opacity 0.3s ease;
```

### Mobile Swipe
```css
transition: transform 0.3s ease-out;
```

### Card Hover
```css
transform: translateY(-2px);
transition: all 0.2s ease-out;
```

### Drag Overlay
```css
transform: rotate(2deg) scale(1.05);
box-shadow: 0 25px 50px rgb(var(--color-brand-background) / 0.15);
```

---

## Mobile Tab Pills

### Container
```css
display: flex;
gap: 8px;
padding: 12px 16px;
overflow-x: auto;
scrollbar-width: none; /* Hide scrollbar */
position: sticky;
top: 0;
z-index: 10;
background: rgb(var(--color-neutral-background-1) / 0.9);
backdrop-filter: blur(12px);
border-bottom: 1px solid rgb(var(--color-neutral-stroke-1) / 0.2);
```

### Active Tab
```css
background: rgb(var(--color-brand-background));
color: white;
box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
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

---

## Accessibility Requirements

1. **Reduced Motion**: Respect `prefers-reduced-motion` media query
2. **Focus States**: Visible focus rings on all interactive elements
3. **Touch Targets**: Minimum 44x44px for mobile tap targets
4. **Contrast**: Maintain WCAG AA contrast ratios
