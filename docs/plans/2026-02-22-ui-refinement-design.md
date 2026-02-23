# Design: HiLo UI Refinement — Warm Luminous Theme

## Overview

Transform the HiLo Playlist App from a dark glassmorphism aesthetic to a warm, luminous light theme with indigo accents. The goal is a general premium refinement pass — shifting the feel from "premium nightclub" to "boutique wellness studio."

**Approach**: Global palette and glass-to-elevation swap (CSS variable + property changes), with focused refinement on highest-impact components (hero sections, recommendation card, calendar cards, modals). All HTML structure and JavaScript logic remain untouched.

---

## 1. Color System

### Core Palette

| Token | Current | New | Purpose |
|-------|---------|-----|---------|
| `--primary` | `#243b33` (dark teal) | `#6B5B8A` (warm indigo) | Primary brand/accent |
| `--accent` | `#c9a15d` (gold) | `#8B78AD` (lighter indigo) | Secondary accent, highlights |
| `--cream` | `#f6f4f0` (off-white text) | `#2D2A26` (warm charcoal) | Primary text color |
| `--ink` | `#0f0f0f` (black) | `#1A1816` (warm near-black) | Headings, emphasis |
| `--ink-light` | `#2b2b2b` (dark gray) | `#6B6560` (warm mid-gray) | Secondary text |
| `--glass` | `rgba(255,255,255,0.08)` | `rgba(107,91,138,0.04)` | Subtle tinted backgrounds |

### Background System

| Layer | Current | New |
|-------|---------|-----|
| Page base | `#0d1512` | `#FAFAF7` (warm white) |
| Page gradient | Dark forest gradient | `radial-gradient(ellipse at top, rgba(107,91,138,0.03), transparent)` |
| Card surface | `rgba(255,255,255,0.06)` | `#FFFFFF` with `box-shadow: 0 1px 3px rgba(0,0,0,0.06)` |
| Elevated surface | `rgba(255,255,255,0.10)` | `#FFFFFF` with `box-shadow: 0 4px 12px rgba(0,0,0,0.08)` |
| Nav bar | `rgba(20,34,28,0.92)` + blur | `rgba(250,250,247,0.88)` + `blur(12px)` + `border-bottom: 1px solid rgba(0,0,0,0.06)` |

### Status Colors (Softened)

| Status | Current | New |
|--------|---------|-----|
| `--success` | `#2ecc71` (vivid green) | `#6BA07A` (muted sage) |
| `--warning` | `#f39c12` (vivid orange) | `#C4956B` (muted amber) |
| `--danger` | `#e74c3c` (vivid red) | `#B87070` (muted rose) |
| `--info` | `#5bb5a2` (vivid teal) | `#7A9DB8` (muted steel blue) |

### Shadows (Three-Tier System)

| Tier | Shadow | Used For |
|------|--------|----------|
| Rest | `0 1px 3px rgba(0,0,0,0.05)` | Cards, tables, pills at rest |
| Raised | `0 4px 12px rgba(0,0,0,0.08)` | Card hover, active dropdowns |
| Floating | `0 8px 32px rgba(0,0,0,0.12)` | Modals, tooltips, popovers |

---

## 2. Component Refinements

### Navigation Bar
- Frosted light glass: `rgba(250,250,247,0.88)` + `blur(12px)`
- Warm charcoal text, bottom border `1px solid rgba(0,0,0,0.06)`
- Active tab: subtle indigo underline, icon color `var(--primary)`
- Inactive tabs: `--ink-light` (#6B6560)

### Hero Sections
- White card with subtle indigo radial wash at top-left: `rgba(107,91,138,0.04)`
- Title in `--ink`, subtitle in `--ink-light`
- No backdrop-filter — soft box-shadow and thin border only

### Cards
- `#FFFFFF` background, `border: 1px solid rgba(0,0,0,0.06)`, Rest shadow
- Hover: shadow deepens to Raised tier
- Primary recommendation card: left border `3px solid var(--primary)` instead of gold border all around

### Buttons
- **Primary**: Solid `#6B5B8A`, white text, no gradient. Hover: `#5C4D7A` + subtle shadow
- **Secondary**: `#F2F0ED` background, `--ink-light` text, thin border. Hover: `#E8E5E0`
- **Danger**: Solid `#B87070`, white text
- **Success/Warning/Info**: Solid muted fill, white text
- All: Remove gradients. Flat, confident fills.

### Pills / Chips
- Base: `#F2F0ED` background, `border: 1px solid rgba(0,0,0,0.06)`, `color: --ink-light`
- Draft: `background: rgba(196,149,107,0.12)`, `color: #9B7A54`
- Finalized: `background: rgba(107,160,122,0.12)`, `color: #5A8A66`
- Info: `background: rgba(122,157,184,0.12)`, `color: #5E8399`

### Tables
- White background, header row `#F8F7F5`, `font-weight: 600` in `--ink-light`
- Row borders: `1px solid rgba(0,0,0,0.04)`. Hover: `#FAFAF7`
- Sortable headers: indigo on hover

### Modals
- Backdrop: `rgba(0,0,0,0.3)` + `blur(8px)` (lighter, airier)
- Content: `#FFFFFF`, `border-radius: 20px`, Floating shadow
- Header border: `1px solid rgba(0,0,0,0.06)`

### Guest Avatars
- Unique muted color per guest via name hash
- Palette of 8 soft tones: lavender, sage, blush, sky, sand, peach, mint, slate

### Calendar Day Cards
- White card, thin border. Today: left border `3px solid var(--primary)`
- Has classes: subtle `rgba(107,91,138,0.03)` tint
- Empty days: `#FAFAF7` background
- Class items: left-border color bars with muted status colors

### Form Inputs
- `#FFFFFF` background, `border: 1px solid rgba(0,0,0,0.12)`, `border-radius: 10px`
- Focus: `border-color: var(--primary)` + `box-shadow: 0 0 0 3px rgba(107,91,138,0.12)`

---

## 3. Typography & Spacing

### Typography Changes

| Element | Current | New |
|---------|---------|-----|
| Hero h1 | 800 weight, white | 700 weight, `#1A1816` |
| Card titles | 700 weight, 16px | 600 weight, 15px |
| Section h2 | 700 weight, 24px, white | 600 weight, 22px, `#1A1816` |
| Body text | 14px, cream/white | 14px, `#2D2A26` |
| Secondary text | `rgba(255,255,255,0.7-0.8)` | `#8A8580` (one consistent value) |
| Metric values | 800 weight, 22px, white | 700 weight, 22px, `#1A1816` |
| Metric labels | 11px uppercase, gold | 11px uppercase, `#8A8580` |
| Step labels | 13px uppercase, gold | 13px uppercase, `var(--primary)` |
| Table headers | 600 weight, 14px | 600 weight, 13px, `#8A8580` |

### Spacing Changes

- Card body padding: `20px` -> `24px`
- Section gap (`--gap`): `24px` -> `28px`
- Table cell padding: `16px 20px` -> `14px 20px`
- Stats bar padding: `12px 16px` -> `14px 20px`

Principle: More whitespace between sections, slightly tighter within components.

---

## 4. Interaction & Polish

### Hover States
- **Buttons**: Background color shift only, no transform
- **Cards**: Shadow deepens from Rest to Raised (no translateY)
- **Table rows**: Background `#F8F7F5`
- **Pills**: No hover transform
- **Links/sortable headers**: Color shift to `var(--primary)`

### Focus States
- All interactive elements: `box-shadow: 0 0 0 3px rgba(107,91,138,0.15)` on `:focus-visible`

### Transitions
- Keep `.15s` (buttons), `.2s` (cards), `.3s` (modals)
- Button active: `scale(0.97)` (softened from 0.95)

### Animations
- Keep fadeIn, slideUp keyframes
- Toast: white background, left border for type indication
- Loading spinner: `var(--primary)` color

### Manifest & Meta
- `theme_color`: `#FAFAF7`
- `background_color`: `#FAFAF7`
- `<meta name="theme-color">`: `#FAFAF7`

---

## 5. What Stays Unchanged

- All HTML structure
- All JavaScript logic
- Layout grids, flex patterns, responsive breakpoints
- Font family stack
- Touch target sizes (44px min)
- Service worker, manifest structure, Firebase config
- Keyframe animation names and structure

---

## Summary

**From**: Dark glassmorphism, gold accent, heavy shadows, rgba white overlays
**To**: Warm white surfaces, warm indigo accent, elevation-based depth, muted status colors

The identity shifts from "premium nightclub" to "boutique wellness studio" — distinctive, warm, and quietly luxurious.
