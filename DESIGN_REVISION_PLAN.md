# HiLo Playlist App — Design Revision Plan

**Goal**: Transform HiLo from a functional tool into an Apple Design Award-caliber experience — one that feels inevitable, delightful, and invisible in its complexity.

---

## Part 1: What's Working Today

Before tearing anything down, it's important to acknowledge what the current design gets right:

- **Dark glass aesthetic** — The deep forest green palette with gold accents is distinctive and premium. This is a strong foundation.
- **Single-file architecture** — Zero build complexity means instant iteration. Don't lose this.
- **Stepped dashboard workflow** (1→2→3) — The numbered steps give the dashboard a clear narrative flow.
- **Real-time sync indicators** — Connection status, pending writes, and toast notifications give confidence in data state.
- **Mobile bottom tab bar** — Correct iOS/Android pattern for thumb-reach navigation.

These are assets to preserve and refine, not replace.

---

## Part 2: Critical Design Issues

### 2.1 Information Overload on the Dashboard

**Problem**: The dashboard tries to be a wizard, a data display, and an action panel simultaneously. The user sees date/time inputs, a guest search, a guest chip tray, a scrollable guest grid, two dropdowns, three status pills, a "Best Fit" card with three metrics, action buttons, AND a runner-up grid — all on a single scroll. This violates the principle of **progressive disclosure**.

**Impact**: New users don't know where to look. Returning users have to mentally re-parse the layout every session. On mobile, it's a very long scroll before you reach the recommendation — the thing you actually came for.

### 2.2 Navigation Doesn't Scale

**Problem**: Six tabs with emoji icons (☰ 📅 ♫ 📖 👥 ⚙) creates several issues:
- The hamburger icon (☰) for "Dashboard" is semantically wrong — hamburger universally means "menu"
- Emoji rendering varies dramatically across OS/browser combinations
- On mobile, 6 cramped bottom tabs with 10px labels are hard to tap accurately
- "Playlists" and "Weekly Planner" feel like they should be one planning surface, not two tabs

### 2.3 Visual Hierarchy Is Flat

**Problem**: Nearly every element uses the same glass card treatment: `rgba(255,255,255,.06)` background, `rgba(255,255,255,.09)` border, same border-radius, same shadow. When everything has the same visual weight, nothing stands out. The "Best Fit Playlist" card — the single most important element in the app — barely differentiates from runner-ups (just a slightly thicker gold border).

### 2.4 Typography Lacks Rhythm

**Problem**: The type scale is narrow. Body text is 14px, labels are 12-13px, headings jump to 22-32px. There's no clear intermediate scale. Letter-spacing is applied inconsistently (0.2px on some headings, 0.5px on labels, 1px on step labels). Line heights aren't defined explicitly, leading to inconsistent vertical rhythm.

### 2.5 Guest Selection Is Cumbersome

**Problem**: The guest selector — the most-used interactive element — requires: (1) typing to search, (2) scanning a grid, (3) tapping individual items, (4) scrolling up to verify chips. For an instructor who runs the same class with roughly the same people week after week, this is friction that compounds. There's no concept of "recent rosters" or "frequent groups."

### 2.6 Weekly Planner Calendar Is Cramped

**Problem**: The 7-column grid works on wide screens but collapses to a single column on mobile, losing the week-at-a-glance benefit entirely. Day cards have a 200px min-height even when empty, wasting space. The add-class interaction requires opening a full modal — heavy for what could be a quick inline action.

### 2.7 Tables Don't Work on Mobile

**Problem**: The History and Playlist Explorer tabs use HTML tables with 4-5 columns. On mobile, these either overflow horizontally (requiring awkward side-scrolling) or compress columns to unreadable widths. Tables are a desktop pattern being forced onto a touch-first audience.

### 2.8 Empty States Are Afterthoughts

**Problem**: Empty states show generic text like "No guest data available / Sign in to see guest profiles." This is a missed opportunity. Empty states are the first thing new users see — they should onboard, educate, and motivate.

### 2.9 No Onboarding Flow

**Problem**: A new user who opens the app for the first time sees an empty dashboard with zero guidance. The stepped workflow labels (①②③) help, but there's no explanation of *what* the app does, *why* freshness scoring matters, or *how* to import existing data. The app assumes domain knowledge.

### 2.10 Accessibility Gaps

**Problem**:
- Color contrast: Gold accent (#c9a15d) on dark green backgrounds may not meet WCAG AA for small text
- Focus indicators: Only form inputs get visible focus rings; buttons and cards rely on hover states that don't exist on touch
- No skip-to-content link
- Tab order within the guest grid isn't managed (no `tabindex`, no `aria-label` on guest items)
- Screen reader support for dynamic content changes (no `aria-live` regions for recommendation updates)
- Sort indicators use pseudo-element arrows without `aria-sort` attributes on table headers

---

## Part 3: Structural Revisions

### 3.1 Restructure Navigation: 4 Tabs + Contextual Sheets

**Current**: 6 flat tabs (Dashboard, Weekly Planner, Playlists, History, Guests, Settings)

**Proposed**: 4 primary tabs + contextual access:

| Tab | Icon (SF Symbols style) | Purpose |
|-----|------------------------|---------|
| **Plan** | `calendar.badge.plus` | Merged Dashboard + Weekly Planner. The primary surface. |
| **Playlists** | `music.note.list` | Playlist explorer with inline metrics |
| **History** | `clock.arrow.circlepath` | Class log + guest profiles (merged) |
| **Settings** | `gearshape` | Account, data, preferences |

**Why merge Dashboard + Weekly Planner?** They share the same mental model: "I'm planning classes." The dashboard's recommendation engine should be *contextual* — when you tap a day in the calendar to add a class, the recommendation appears right there, not on a separate tab. This eliminates the back-and-forth between tabs that the current design requires.

**Why merge History + Guests?** Guest profiles are derived from history. Viewing a guest's card naturally leads to their attendance history and vice versa. A segmented control at the top of the History tab ("Classes | Guests") provides instant switching without consuming a tab slot.

**Implementation**:
- Replace emoji icons with inline SVG icons for cross-platform consistency
- Use consistent 24x24 icon grid with 2px stroke weight
- Mobile: 4 bottom tabs with comfortable 64px touch targets (up from ~52px)
- Desktop: Horizontal top tabs with text labels, no icons needed

### 3.2 Redesign the Planning Flow as a Single Surface

**Current flow**: Dashboard tab → set date/time → select guests → see recommendation → save draft → switch to Weekly Planner tab → verify → open modal → finalize

**Proposed flow**: Plan tab shows the week calendar. Tap any day → slide-up sheet with date pre-filled → select guests (smart suggestions first) → recommendation appears inline → save/finalize → sheet dismisses, calendar updates live.

**Key changes**:
- The calendar IS the dashboard. No separate recommendation screen.
- Recommendations appear *inside* the planning sheet as you select guests, updating in real-time
- "Best Fit" becomes a prominent inline suggestion with a single "Use This" tap
- Runner-ups collapse into an expandable "See alternatives" row
- The recommendation section uses a distinctive visual treatment — not a card, but a highlighted recommendation bar with the playlist number large and prominent

### 3.3 Redesign Guest Selection with Smart Defaults

**Current**: Flat grid of every guest, manual selection each time.

**Proposed** — Tiered selection with smart suggestions:

1. **Recent Rosters** (top, most prominent): "Last Tuesday 9am: Sarah, Mike, Jenna, Tom" — one tap to reuse an entire previous roster
2. **Frequent Guests** (second tier): Guests sorted by attendance frequency, with attendance count badges
3. **All Guests** (third tier, collapsed by default): The current full grid, accessible via "Show all guests"
4. **Quick Add**: Inline text input to add a new guest name on the fly (currently requires going to history/CSV)

This turns a 15-tap operation into a 1-2 tap operation for the common case.

### 3.4 Replace Tables with Card Lists on Mobile

For History and Playlist Explorer, use responsive layouts:

- **Desktop (>768px)**: Keep the table — it's the right pattern for data-dense views on wide screens
- **Mobile (≤768px)**: Replace table rows with stacked cards. Each card shows:
  - Primary info large (date + playlist # for history; playlist # + status for explorer)
  - Secondary info smaller (guest count, tags)
  - Tap to expand for full details

Use CSS to show/hide the appropriate layout rather than rendering both.

---

## Part 4: Visual Design Revisions

### 4.1 Establish a Clear Visual Hierarchy with 3 Depth Levels

Instead of one glass treatment for everything, define three distinct levels:

| Level | Usage | Treatment |
|-------|-------|-----------|
| **Surface** | Page background, tab bar | Solid dark gradient (current) |
| **Elevated** | Cards, sections, sheets | `rgba(255,255,255, 0.05)` bg, subtle 1px border, standard shadow |
| **Prominent** | Primary recommendation, active selection, CTAs | `rgba(201,161,93, 0.08)` bg, gold border, elevated shadow, slight scale |

**The recommendation card** should be the ONLY element at the "Prominent" level at any given time. This creates a natural focal point.

### 4.2 Refined Color System

Keep the forest green + gold identity but introduce more nuance:

```css
:root {
  /* Core palette — keep */
  --primary: #243b33;
  --accent: #c9a15d;
  --cream: #f6f4f0;

  /* NEW: Semantic surface colors */
  --surface-0: #0d1512;           /* Deepest background */
  --surface-1: #141f1b;           /* Card background */
  --surface-2: #1a2b24;           /* Elevated card / hover */
  --surface-3: #213830;           /* Active/selected state */

  /* NEW: Text hierarchy */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.70);
  --text-tertiary: rgba(255, 255, 255, 0.45);
  --text-accent: #d4aa5f;         /* Slightly lighter gold for text readability */

  /* NEW: Border hierarchy */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-emphasis: rgba(255, 255, 255, 0.18);

  /* Status colors — keep but add accessible alternatives */
  --success: #34d399;             /* Slightly adjusted for contrast */
  --warning: #fbbf24;
  --danger: #f87171;
  --info: #60a5fa;
}
```

### 4.3 Typography Scale with Rhythm

Adopt a modular scale (1.25 ratio) with explicit line heights:

```css
/* Display — Page titles */
--text-display:  32px / 1.2;   /* font-weight: 800 */

/* Title — Section headings */
--text-title:    24px / 1.3;   /* font-weight: 700 */

/* Heading — Card titles, emphasis */
--text-heading:  18px / 1.4;   /* font-weight: 600 */

/* Body — Default readable text */
--text-body:     15px / 1.5;   /* font-weight: 400 */

/* Caption — Labels, metadata */
--text-caption:  13px / 1.4;   /* font-weight: 500 */

/* Micro — Badges, tiny labels */
--text-micro:    11px / 1.3;   /* font-weight: 600, uppercase, letter-spacing: 0.5px */
```

**Key change**: Body text goes from 14px → 15px. This single pixel dramatically improves readability on mobile screens. Consistent line-height ratios create natural vertical rhythm.

### 4.4 Spacing System

Replace ad-hoc pixel values with a consistent 4px-based scale:

```
--space-1:  4px     (tight, inline gaps)
--space-2:  8px     (chip gaps, tight padding)
--space-3:  12px    (standard inline gap)
--space-4:  16px    (card padding, section gap)
--space-5:  20px    (between related sections)
--space-6:  24px    (between distinct sections)
--space-8:  32px    (major section breaks)
--space-10: 40px    (page-level padding)
```

Currently the app mixes 6px, 8px, 10px, 12px, 14px, 16px, 18px, 20px, 24px, 28px arbitrarily. A constrained scale creates visual harmony.

### 4.5 Border Radius Consistency

Currently: `--radius: 16px`, `--radius-lg: 22px`, plus hardcoded 8px, 10px, 12px, 14px, 999px scattered throughout.

**Proposed system**:
```
--radius-sm:   8px    (small inputs, compact chips, inner elements)
--radius-md:   12px   (buttons, cards, standard containers)
--radius-lg:   16px   (modals, sheets, hero sections)
--radius-full: 999px  (pills, avatars, circular elements only)
```

### 4.6 Shadow System

Replace the single `--shadow` variable with contextual shadows:

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.2);                              /* Subtle lift */
--shadow-md:  0 4px 12px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1); /* Standard card */
--shadow-lg:  0 12px 32px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.15);/* Modal, sheet */
--shadow-glow: 0 0 24px rgba(201,161,93,0.15);                        /* Accent glow for recommendation */
```

---

## Part 5: Interaction & Animation Revisions

### 5.1 Meaningful Motion, Not Decorative

**Remove**: The current `translateY(-2px)` hover lift on every card and pill. When everything lifts, nothing feels elevated. Hover effects should be reserved for *interactive* elements.

**Add**:
- **Recommendation reveal**: When the freshness algorithm finishes computing, the recommendation card should fade-in with a subtle scale (0.98 → 1.0) over 300ms. This creates a moment of "reveal" that makes the recommendation feel considered.
- **Guest chip add/remove**: Use `layout` animations. When a chip is added, existing chips should smoothly reflow. When removed, the chip should scale down and fade rather than just disappearing.
- **Tab transitions**: Content should crossfade (150ms) when switching tabs, not snap instantly.
- **Sheet presentation**: The planning sheet should spring up from the bottom with a physics-based easing curve (`cubic-bezier(0.32, 0.72, 0, 1)`) mimicking iOS sheet behavior.
- **Toast notifications**: Enter from bottom-right with spring physics, exit with a quick ease-out. Stack toasts with smooth reflow.

### 5.2 Haptic-Aware Interactions (PWA Enhancement)

For mobile PWA users, add `navigator.vibrate()` micro-feedback:
- **10ms pulse** on guest selection toggle
- **15ms pulse** on "Save Draft" and "Finalize" confirmation
- This is subtle but creates a tactile connection to actions

### 5.3 Pull-to-Refresh Pattern

On the Plan tab (mobile), implement pull-to-refresh to manually trigger a Firestore sync. Use the gold accent color for the refresh spinner. This gives users an explicit "check for updates" gesture they already know from native apps.

### 5.4 Swipe Actions on Cards (Mobile)

On History cards (mobile view):
- **Swipe left**: Reveal "View Details" action
- **Swipe right**: Quick-copy roster to clipboard

On Weekly Planner class items:
- **Swipe left**: Delete draft
- **Swipe right**: Finalize

These reduce the need for modals and make common actions faster.

---

## Part 6: Component-Level Revisions

### 6.1 Navigation Bar

**Current issues**:
- Auth buttons (Sign In / user name / Sign Out) in the nav bar compete with tab navigation
- On mobile, the brand logo + auth buttons share a cramped top row

**Proposed**:
- Move auth entirely to Settings tab. The nav bar should ONLY contain the brand mark and navigation.
- Desktop: Brand left, tabs center-aligned, no right content
- Mobile: Brand in a slim top bar (44px), tabs at bottom (56px + safe area)
- The brand mark could be the solo SVG icon on mobile (no text) to save space

### 6.2 Recommendation Card (The Hero Moment)

This is the most important UI element. It deserves special treatment:

```
┌─────────────────────────────────────────────┐
│  ✦  RECOMMENDED                             │
│                                              │
│     Playlist #7                              │
│     ███████████████░░░  87% Fresh            │
│                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │  4   │  │ 23d  │  │ 12%  │              │
│  │Never │  │Median│  │Stale │              │
│  └──────┘  └──────┘  └──────┘              │
│                                              │
│  [  Use This Playlist  ]  [ Alternatives ▾ ]│
└─────────────────────────────────────────────┘
```

Key changes:
- Add a **freshness progress bar** — the single most intuitive visualization of "how good is this pick." A near-full green bar instantly communicates quality.
- The playlist number should be **large** (28-36px, bold) — it's the primary information
- "Use This Playlist" as the primary CTA replaces the current three-button cluster (Save Draft / Finalize / View Details). A single clear action with secondary options in a dropdown.
- The "Alternatives" button expands to show runner-ups inline, not as separate cards

### 6.3 Guest Chips

**Current**: Gold gradient chips with × button. They work but lack personality.

**Proposed**:
- Add an **avatar circle** (first letter, colored) to each chip for quick visual scanning
- Use a **consistent color per guest** (hash the name to pick from a curated palette of 8 colors). This means "Sarah" is always teal, "Mike" is always orange — instant recognition.
- Larger touch targets: minimum 36px height (currently ~32px)
- Animate reflow on add/remove

### 6.4 Weekly Calendar

**Proposed redesign**:

- **Mobile**: Replace 7-column grid with a **horizontal scrollable week strip** at the top (showing day abbreviation + date number), with the selected day's classes shown below. This is the pattern used by Apple Calendar, Google Calendar, and Fantastical.
- **Desktop**: Keep 7-column grid but refine:
  - Empty days: Show a subtle "+" button centered, no 200px min-height
  - Days with classes: Size dynamically based on content
  - Today: Blue accent left border (4px) instead of full border change
  - Finalized classes: Green left accent bar
  - Draft classes: Gold left accent bar

### 6.5 Playlist Explorer

Transform from a flat table to a more useful management view:

- **Card-based grid** (mobile and desktop) instead of table
- Each playlist card shows:
  - Playlist number (large)
  - Status badge (Active/Retired)
  - Tag chips (editable inline)
  - Key metric: "Last used X days ago" or "Used by Y% of guests"
  - Expandable section for detailed freshness breakdown
- **Filter bar**: Quick filters for Active/Retired/All + tag filter
- **Drag to reorder** (optional, nice-to-have) for custom playlist ordering

### 6.6 Modals → Sheets

Replace the current centered modal with a **bottom sheet** pattern:

- Slides up from bottom on mobile (more natural reach)
- Centered on desktop (current behavior, refined)
- **Drag handle** at top for pull-down dismiss (mobile)
- **Snap points**: Half-height for quick actions, full-height for forms
- Backdrop blur stays (it's good)

### 6.7 Toast Notifications

**Current**: Toasts are visually loud (solid colored backgrounds). Multiple toasts stack without grouping.

**Proposed**:
- Use translucent dark background for all toasts (like iOS notifications)
- Color-code via a **left accent bar** (4px) instead of full background
- Auto-dismiss after 3 seconds (currently seems longer)
- Include an **undo action** on destructive toasts ("Class deleted. [Undo]")
- Position: Bottom-center on mobile (above tab bar), bottom-right on desktop

---

## Part 7: Empty States & Onboarding

### 7.1 First-Run Experience

When the app loads for the first time (no localStorage data, not signed in):

**Step 1 — Welcome Screen** (replaces empty dashboard):
```
     ✦

  Welcome to HiLo

  The smartest way to keep your
  class playlists fresh.

  HiLo tracks which guests have heard
  which playlists, then recommends the
  freshest pick for every class.

  [ Get Started ]
```

**Step 2 — Quick Setup** (after tap):
- "Do you have existing class data?" → Yes: Show CSV import → No: "Let's plan your first class"
- "Sign in to sync across devices" → Google Sign-In button → "Maybe later" skip link

**Step 3 — Guided First Class**:
- Pre-fill today's date and a default time
- Highlight the guest selector: "Add the names of people in your next class"
- After adding 2+ guests, animate the recommendation in: "Based on your roster, here's the freshest playlist..."

### 7.2 Tab-Specific Empty States

Each tab should have a purposeful empty state:

**History (empty)**:
```
  📋  No classes yet

  Your class history will appear here after
  you finalize your first class.

  [ Plan a Class → ]
```

**Guests (empty)**:
```
  👤  No guests yet

  Guest profiles are built automatically
  as you plan and finalize classes.

  [ Import from CSV ]  [ Add Your First Class → ]
```

**Playlists (empty — impossible in current design since defaults exist, but for retired-all state)**:
```
  🎵  All playlists retired

  Activate a playlist to start using it
  in recommendations.
```

### 7.3 Contextual Tips

Add dismissible, one-time tips at key moments:
- First time seeing a recommendation: "💡 Higher scores mean this playlist is fresher for your group"
- First time in Weekly Planner: "💡 Tap any day to plan a class. Drag to rearrange."
- First time opening Playlist Explorer: "💡 Add tags to organize playlists by class type"

Store dismissed tips in localStorage to show each only once.

---

## Part 8: Accessibility Overhaul

### 8.1 Color Contrast

Run every text/background combination through WCAG AA checker:

| Element | Current | Issue | Fix |
|---------|---------|-------|-----|
| Gold accent on dark bg | #c9a15d on #1b2d25 | ~4.2:1 (borderline AA for small text) | Use #d4aa5f for text, keep #c9a15d for decorative |
| Muted text | rgba(255,255,255,.5) on #1b2d25 | ~3.8:1 (fails AA) | Raise to rgba(255,255,255,.60) minimum |
| Tertiary text | rgba(255,255,255,.45) | ~3.2:1 (fails AA) | Only use for non-essential decorative text, or raise to .55 |
| Status pills text | Various colored on transparent | Varies | Ensure all meet 4.5:1 |

### 8.2 Focus Management

```css
/* Visible focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: inherit;
}

/* Remove default outline only when NOT keyboard navigating */
:focus:not(:focus-visible) {
  outline: none;
}
```

Apply to ALL interactive elements: buttons, inputs, tab buttons, guest items, table rows.

### 8.3 ARIA Enhancements

- Add `aria-live="polite"` to the recommendation card container — screen readers should announce when the recommendation updates
- Add `aria-sort="ascending|descending|none"` to sortable table headers
- Add `role="status"` to the connection status indicator
- Add `aria-label` to icon-only buttons (close, remove, add tag)
- Add `role="listbox"` + `role="option"` to the guest selector grid
- The modal should trap focus when open (current implementation doesn't trap focus)
- Add `aria-expanded` to expandable sections (runner-ups, tag editors)

### 8.4 Keyboard Navigation

- **Tab through guests**: Arrow keys to navigate the guest grid, Space/Enter to toggle selection
- **Escape key**: Close any open modal/sheet/dropdown (partially implemented, needs consistency)
- **Tab cycling**: When a modal is open, Tab should cycle within the modal only

### 8.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Part 9: Performance & Polish

### 9.1 Perceived Performance

- **Skeleton screens**: When data is loading, show placeholder shapes (gray pulsing rectangles) instead of empty states or spinners. This makes the app feel like it's "already there" and just filling in.
- **Optimistic updates**: When saving a draft, update the UI immediately and write to Firestore in the background. If the write fails, revert and show an error toast. (Partially implemented — make it consistent.)
- **Lazy rendering**: Only render the active tab's content. Currently all 6 sections exist in the DOM. For a single-file app this is fine for initial load, but heavy data (hundreds of history rows) should use virtual scrolling or pagination.

### 9.2 Data Visualization

Replace raw numbers with visual representations where possible:

- **Freshness score**: Progress bar (0-100% visual) instead of just a number
- **Staleness**: Color-coded (green < 30 days, yellow 30-60, red > 60)
- **Guest attendance frequency**: Small sparkline or dot chart on guest cards
- **Playlist usage**: Mini bar showing relative usage across playlists in the explorer

### 9.3 Micro-polish Items

- **Date inputs**: Style the native date/time pickers or add a custom date picker that matches the app aesthetic (native pickers look jarring against a dark glass UI)
- **Select dropdowns**: Replace native `<select>` with custom dropdowns that match the design system (native selects break the visual consistency on desktop)
- **Scrollbar styling**: Add custom dark scrollbar styling for WebKit browsers
- **Selection state**: When a playlist is "selected" (in use for the current class), its row/card should glow subtly
- **Loading button states**: The current spinner replacement is good — also add a subtle pulse animation to the button background during loading
- **Smooth number transitions**: When metric values change (never-heard count, median days), animate the number change with a counting effect

---

## Part 10: Implementation Prioritization

### Phase 1: Foundation (High Impact, Moderate Effort)
1. **Implement the design token system** (colors, typography, spacing, radii, shadows)
2. **Fix accessibility** (contrast, focus management, ARIA)
3. **Redesign the recommendation card** with progress bar and clearer hierarchy
4. **Replace emoji tab icons** with consistent SVGs
5. **Add empty states and contextual tips**
6. **Improve guest selection** with recent rosters and frequency sorting

### Phase 2: Structure (High Impact, High Effort)
7. **Merge Dashboard + Weekly Planner** into unified Plan tab
8. **Implement bottom sheets** replacing centered modals
9. **Mobile-responsive History/Explorer** with card layouts
10. **Redesign Weekly Calendar** with mobile week strip
11. **First-run onboarding flow**

### Phase 3: Delight (Moderate Impact, Moderate Effort)
12. **Animation system overhaul** (meaningful motion, spring physics)
13. **Smart guest suggestions** (recent rosters, frequent groups)
14. **Custom date/time pickers and select dropdowns**
15. **Data visualizations** (progress bars, color-coding, sparklines)
16. **Swipe gestures on mobile cards**
17. **Pull-to-refresh**
18. **Reduced motion support**
19. **Skeleton loading screens**

### Phase 4: Excellence (Lower Impact, Worth Doing)
20. **Haptic feedback for PWA**
21. **Number counting animations**
22. **Custom scrollbars**
23. **Keyboard shortcut system** (e.g., N for new class, / for search)
24. **Undo on destructive actions**

---

## Part 11: Design Principles to Guide Every Decision

As changes are implemented, measure every choice against these principles:

1. **The recommendation is the product.** Every pixel should serve the goal of getting the freshest playlist in front of the instructor with minimum friction. If a UI element doesn't contribute to that, question whether it belongs.

2. **One primary action per screen.** At any moment, the user should know exactly what to do next. Don't present Save Draft, Finalize, and View Details as equal options. There's always a "most likely next step."

3. **Respect the repeat user.** This app is used weekly, possibly daily, by the same people. Optimize for the 100th use, not the 1st. That means smart defaults, remembered preferences, and shortcuts for common patterns.

4. **Show, don't tell.** A progress bar communicates freshness faster than three separate metric numbers. A colored dot communicates status faster than a text label. Visual encoding > text labels wherever possible.

5. **Touch-first, not mobile-last.** This is a PWA used on phones during class setup. Every tap target should be 44px minimum. Every action should be reachable with one thumb. Scrolling should be the primary navigation mechanic, not tapping between tabs.

---

*This plan is designed to be implemented incrementally. Each phase delivers user-visible improvements. No phase depends on the completion of a later phase. Start with Phase 1 to establish the visual foundation, then build upward.*
