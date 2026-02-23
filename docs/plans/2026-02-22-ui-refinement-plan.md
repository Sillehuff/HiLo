# UI Refinement Implementation Plan — Warm Luminous Theme

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform HiLo from dark glassmorphism to a warm white/indigo light theme with muted status colors and Apple-level polish.

**Architecture:** CSS-only changes to `index.html` (single-file PWA), plus `manifest.json` and `sw.js` cache version bump. No HTML structure or JavaScript logic changes. All changes are in the `<style>` tag (lines ~17-1987) plus meta tag (line 12).

**Tech Stack:** Vanilla CSS custom properties, no build tools. Verify via Playwright browser snapshot after each task.

**Design doc:** `docs/plans/2026-02-22-ui-refinement-design.md`

---

### Task 1: Foundation — CSS Custom Properties & Page Base

**Files:**
- Modify: `index.html` — `:root` block (lines 17-37), `html, body` (lines 40-52), meta tag (line 12)
- Modify: `manifest.json` — theme_color, background_color

**Step 1: Update `:root` CSS custom properties (lines 17-37)**

Replace the entire `:root` block with:

```css
:root {
  --primary: #6B5B8A;
  --accent: #8B78AD;
  --cream: #2D2A26;
  --ink: #1A1816;
  --ink-light: #6B6560;
  --secondary-text: #8A8580;
  --glass: rgba(107,91,138,0.04);
  --surface: #FFFFFF;
  --surface-hover: #F8F7F5;
  --surface-secondary: #F2F0ED;
  --page-bg: #FAFAF7;
  --border: rgba(0,0,0,0.06);
  --border-strong: rgba(0,0,0,0.12);
  --radius: 16px;
  --radius-lg: 22px;
  --shadow-rest: 0 1px 3px rgba(0,0,0,0.05);
  --shadow-raised: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-floating: 0 8px 32px rgba(0,0,0,0.12);
  --shadow: var(--shadow-rest);
  --inner-shadow: none;
  --blur: blur(12px);
  --gap: 28px;
  --success: #6BA07A;
  --warning: #C4956B;
  --danger: #B87070;
  --info: #7A9DB8;
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
}
```

**Step 2: Update `html, body` styles (lines 40-52)**

Replace background and color:

```css
html, body {
  margin: 0; padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Helvetica Neue", Arial, system-ui, sans-serif;
  background-color: var(--page-bg);
  background: var(--page-bg);
  color: var(--cream);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.4;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
}
```

**Step 3: Update meta theme-color (line 12)**

```html
<meta name="theme-color" content="#FAFAF7" />
```

**Step 4: Update manifest.json**

Change `background_color` and `theme_color` to `"#FAFAF7"`.

**Step 5: Bump service worker cache version in `sw.js`**

Change `hilo-playlist-v3` to `hilo-playlist-v4`.

**Step 6: Verify in browser**

Open the app — page background should be warm white, text warm charcoal. Everything else will look broken (components still have hardcoded dark values). That's expected.

**Step 7: Commit**

```bash
git add index.html manifest.json sw.js
git commit -m "feat: foundation — new CSS variables, page base, and manifest for light theme"
```

---

### Task 2: Navigation & Tab Bar

**Files:**
- Modify: `index.html` — `.nav` (lines ~55-64), `.tab-btn` variants (lines ~73-99), `.tabs` container

**Step 1: Update nav styles**

Replace `.nav` background and border:

```css
.nav {
  /* keep layout properties unchanged */
  background: rgba(250, 250, 247, .88);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  border-bottom: 1px solid var(--border);
}
```

**Step 2: Update tab button styles**

```css
.tab-btn {
  /* keep layout/size properties */
  background: transparent;
  border: 1px solid transparent;
  color: var(--ink-light);
  /* keep transitions, padding, etc. */
}

/* Active tab */
.tab-btn[aria-selected="true"] {
  background: rgba(107,91,138,0.08);
  border-color: rgba(107,91,138,0.15);
  color: var(--primary);
  box-shadow: none;
}

/* Hover */
.tab-btn:hover {
  background: rgba(107,91,138,0.05);
}
```

Replace all hardcoded `rgba(201,161,93,...)` in tab styles with indigo equivalents.

**Step 3: Update mobile tab bar overrides (lines ~1717-1770)**

- Nav mobile bg: `rgba(250, 250, 247, .98)`
- Tab bar mobile bg: `rgba(250, 250, 247, .98)`
- Border: `border-top: 1px solid var(--border)`
- Active tab icon color: `var(--primary)`
- Active tab dot: `background: var(--primary)`

**Step 4: Verify — nav and tabs should look clean on warm white background**

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: light theme nav bar and tab buttons"
```

---

### Task 3: Hero Sections

**Files:**
- Modify: `index.html` — `.hero` (lines ~111-121), `h1` styles, `.subtle` class

**Step 1: Update hero styles**

```css
.hero {
  border-radius: var(--radius-lg);
  padding: clamp(24px, 4vw, 40px);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-rest);
}
```

Remove backdrop-filter and all radial gradient references from hero.

**Step 2: Update h1 and subtitle**

```css
h1 {
  /* keep clamp sizing */
  font-weight: 700;
  color: var(--ink);
}

.subtle {
  color: var(--secondary-text);
}
```

**Step 3: Verify — hero sections on Dashboard, Settings, Weekly Planner should be clean white cards**

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: light theme hero sections"
```

---

### Task 4: Cards & Primary Card

**Files:**
- Modify: `index.html` — `.card` (lines ~381-402), `.primary-card`, `.card .title`, `.card .muted`

**Step 1: Update card styles**

```css
.card {
  position: relative;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-rest);
  overflow: hidden;
  transition: all .3s ease;
}

.card:hover {
  box-shadow: var(--shadow-raised);
}

.card .body { padding: 24px; }
.card .title { font-weight: 600; font-size: 15px; letter-spacing: .2px; margin-bottom: 6px; color: var(--ink); }
.card .muted { color: var(--secondary-text); font-size: 14px; }
```

Remove `transform: translateY(-2px)` from card hover.

**Step 2: Update primary card**

```css
.primary-card {
  background: var(--surface);
  border-left: 3px solid var(--primary);
  border-color: var(--border);
  border-left-color: var(--primary);
  border-width: 1px;
  border-left-width: 3px;
}

.primary-card .title { color: var(--ink); font-size: 18px; font-weight: 700; }
```

**Step 3: Verify — cards across all tabs should be white with subtle shadows**

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: light theme cards with elevation shadows"
```

---

### Task 5: Buttons (All Variants)

**Files:**
- Modify: `index.html` — `.btn` (lines ~491-549), `.btn-xs` (lines ~1536-1554), `.btn-ghost` (lines ~312-325)

**Step 1: Update base button**

```css
.btn {
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--surface-secondary);
  border: 1px solid var(--border-strong);
  color: var(--ink-light);
  cursor: pointer;
  transition: all .15s ease;
  font-weight: 600;
  font-size: 14px;
  min-height: 44px;
  display: inline-flex;
  align-items: center; justify-content: center;
  gap: 6px;
}

.btn:hover {
  background: #E8E5E0;
  box-shadow: none;
  transform: none;
}

.btn:active { transform: scale(.97); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(107,91,138,0.15);
}
```

**Step 2: Update button variants**

```css
.btn-primary { background: var(--primary); border-color: var(--primary); color: #fff; }
.btn-primary:hover { background: #5C4D7A; box-shadow: 0 2px 8px rgba(107,91,138,0.25); }

.btn-success { background: var(--success); border-color: var(--success); color: #fff; }
.btn-success:hover { background: #5C8E6B; }

.btn-warning { background: var(--warning); border-color: var(--warning); color: #fff; }
.btn-warning:hover { background: #B3865E; }

.btn-danger { background: var(--danger); border-color: var(--danger); color: #fff; }
.btn-danger:hover { background: #A86262; }

.btn-info { background: var(--info); border-color: var(--info); color: #fff; }
.btn-info:hover { background: #6B8DA8; }
```

**Step 3: Update `.btn-xs`**

```css
.btn-xs {
  padding: 8px 12px;
  min-height: 44px;
  font-size: 13px;
  border-radius: 8px;
  background: var(--surface-secondary);
  border: 1px solid var(--border);
  color: var(--ink-light);
  cursor: pointer;
  transition: all .15s ease;
  font-weight: 500;
  display: inline-flex;
  align-items: center; justify-content: center;
}

.btn-xs:hover { background: #E8E5E0; color: var(--ink); }
```

**Step 4: Update `.btn-ghost`**

```css
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--ink-light);
}
.btn-ghost:hover { background: var(--surface-secondary); }
```

**Step 5: Verify — buttons across all tabs**

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat: light theme buttons — flat fills, no gradients"
```

---

### Task 6: Pills, Status Indicators & Strength Pills

**Files:**
- Modify: `index.html` — `.pill` (lines ~132-139), status pills (lines ~353-357), `.rec-strength-pill` variants (lines ~563-587), `.class-type-tag` (lines ~144-158)

**Step 1: Update base pill**

```css
.pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--surface-secondary);
  border: 1px solid var(--border);
  padding: 8px 12px; border-radius: 999px;
  font-size: 13px;
  color: var(--ink-light);
  transition: all .2s ease;
}

.pill:hover { /* remove translateY transform */ }
```

**Step 2: Update status pills**

```css
.status-connected { background: rgba(107,160,122,0.10); border-color: rgba(107,160,122,0.25); color: #5A8A66; }
.status-disconnected { background: rgba(184,112,112,0.10); border-color: rgba(184,112,112,0.25); color: #9B5E5E; }
.status-draft { background: rgba(196,149,107,0.10); border-color: rgba(196,149,107,0.25); color: #9B7A54; }
.status-finalized { background: rgba(107,160,122,0.10); border-color: rgba(107,160,122,0.25); color: #5A8A66; }
.status-info { background: rgba(122,157,184,0.10); border-color: rgba(122,157,184,0.25); color: #5E8399; }
```

**Step 3: Update recommendation strength pills**

```css
.rec-strength-pill.strong {
  background: rgba(107,160,122,0.12);
  border: 1px solid rgba(107,160,122,0.30);
  color: #4A7A56;
}

.rec-strength-pill.moderate {
  background: rgba(196,149,107,0.12);
  border: 1px solid rgba(196,149,107,0.30);
  color: #8B6A44;
}

.rec-strength-pill.close {
  background: rgba(122,157,184,0.12);
  border: 1px solid rgba(122,157,184,0.30);
  color: #4E7389;
}
```

**Step 4: Update class type tags**

```css
.class-type-tag {
  background: rgba(122,157,184,0.10);
  border: 1px solid rgba(122,157,184,0.25);
  color: #5E8399;
}
```

**Step 5: Update tag chip removable**

```css
.tag-chip-removable {
  background: rgba(122,157,184,0.10);
  border: 1px solid rgba(122,157,184,0.25);
  color: #5E8399;
  /* keep layout properties */
}
```

**Step 6: Update status toggle (Playlist Explorer)**

```css
.status-toggle.active {
  background: rgba(107,160,122,0.12);
  border-color: rgba(107,160,122,0.30);
  color: #5A8A66;
}

.status-toggle.retired {
  background: var(--surface-secondary);
  border-color: var(--border);
  color: var(--secondary-text);
}
```

**Step 7: Verify — pills and status indicators across all tabs**

**Step 8: Commit**

```bash
git add index.html
git commit -m "feat: light theme pills, status indicators, and tags"
```

---

### Task 7: Tables & Sortable Headers

**Files:**
- Modify: `index.html` — `.table-container` (lines ~927-935), `.data-table` (lines ~940-967), `.sortable` (lines ~968-993)

**Step 1: Update table styles**

```css
.table-container {
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.data-table th, .data-table td {
  text-align: left;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}

.data-table th {
  color: var(--secondary-text);
  font-weight: 600;
  background: var(--surface-hover);
  font-size: 13px;
  letter-spacing: 0.5px;
}

.data-table tbody tr:hover {
  background: var(--surface-hover);
  transition: background 0.2s ease;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}
```

**Step 2: Update sortable headers**

```css
.sortable:hover { color: var(--primary); }
```

**Step 3: Update `.rank-row-assigned` and `.rank-score`**

```css
.rank-row-assigned td { background: rgba(107,160,122,0.06); }
.rank-score { font-weight: 700; color: var(--primary); }
```

**Step 4: Update `.btn-remove-playlist`**

```css
.btn-remove-playlist {
  background: rgba(184,112,112,0.08);
  border: 1px solid rgba(184,112,112,0.20);
  color: #9B5E5E;
  /* keep layout properties */
}

.btn-remove-playlist:hover {
  background: rgba(184,112,112,0.15);
  border-color: rgba(184,112,112,0.35);
  color: var(--danger);
}
```

**Step 5: Verify — tables in Playlist Explorer, History, and Dashboard rankings**

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat: light theme tables and sortable headers"
```

---

### Task 8: Modals

**Files:**
- Modify: `index.html` — `.modal` (lines ~1191-1220), `.modal__content`, `.modal__header`, `.modal__footer`, modal recommendation panel (lines ~1278-1284)

**Step 1: Update modal styles**

```css
.modal {
  /* keep positioning */
  background: rgba(0,0,0,.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  /* keep z-index, display, padding, animation */
}

.modal__content {
  background: var(--surface);
  backdrop-filter: none;
  border: 1px solid var(--border);
  border-radius: 20px;
  /* keep max-width, width, max-height, display, flex-direction */
  box-shadow: var(--shadow-floating);
  animation: slideUp .3s ease;
}

.modal__header {
  /* keep layout */
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.modal__header h3 {
  /* keep margin/sizing */
  color: var(--ink);
}

.modal__close {
  /* keep layout */
  color: var(--secondary-text);
}

.modal__close:hover {
  background: var(--surface-secondary);
  color: var(--ink);
}

.modal__footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  /* keep layout */
}
```

**Step 2: Update modal recommendation panel**

```css
/* Modal recommendation panel */
background: rgba(107,91,138,0.04);
border: 1px solid rgba(107,91,138,0.12);
```

**Step 3: Update mobile modal overrides**

- Modal footer bg: `var(--surface)`
- Drag handle: `background: rgba(0,0,0,0.15)`
- Form section divider: `border-top: 1px solid var(--border)`

**Step 4: Verify — open a modal (Plan New Class) and check appearance**

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: light theme modals with frosted glass backdrop"
```

---

### Task 9: Metrics, Step Labels & Best Summary

**Files:**
- Modify: `index.html` — `.metric` (lines ~403-414), `.step-label` (lines ~1500-1523), `.best-summary-title` (lines ~588-593), `.best-insight` (lines ~604-620)

**Step 1: Update metrics**

```css
.metric {
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 10px;
  text-align: center;
}

.metric .value { font-weight: 700; font-size: 22px; color: var(--ink); }
.metric .label { color: var(--secondary-text); /* keep size, uppercase, spacing */ }
```

**Step 2: Update step labels**

```css
.step-label {
  /* keep layout */
  color: var(--primary);
}

.step-label .step-num {
  /* keep layout */
  background: rgba(107,91,138,0.10);
  border: 1px solid rgba(107,91,138,0.25);
  color: var(--primary);
}
```

**Step 3: Update best insight cards**

```css
.best-insight {
  /* keep layout */
  background: var(--surface-hover);
  border: 1px solid var(--border);
  color: var(--cream);
}

.best-insight b { color: var(--primary); }
```

**Step 4: Verify — Dashboard recommendation display**

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: light theme metrics, step labels, and insights"
```

---

### Task 10: Form Inputs, Search & Stats Bar

**Files:**
- Modify: `index.html` — form inputs (lines ~1409-1422), `.search-container` (lines ~854-911), `.stats-bar` (lines ~1556-1576), `.form-section-divider`

**Step 1: Update form inputs/selects/textareas**

```css
input, select, textarea {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  color: var(--cream);
  border-radius: 10px;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(107,91,138,0.12);
  outline: none;
}

input::placeholder { color: var(--secondary-text); }
```

**Step 2: Update search container**

```css
.search-container input {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  color: var(--cream);
}

.search-clear {
  background: var(--surface-secondary);
  color: var(--secondary-text);
}

.search-clear:hover {
  background: #E8E5E0;
  color: var(--ink);
}
```

**Step 3: Update stats bar**

```css
.stats-bar {
  background: var(--surface-hover);
  border: 1px solid var(--border);
  /* keep layout, padding: 14px 20px */
}

.stats-bar .stat-item { color: var(--ink-light); }
.stats-bar .stat-value { color: var(--primary); }
```

**Step 4: Update form divider**

```css
.form-section-divider { border-top: 1px solid var(--border); }
```

**Step 5: Verify — form inputs in modals, search in History/Guests tabs, stats bars**

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat: light theme form inputs, search, and stats bar"
```

---

### Task 11: Calendar Day Cards & Class Items

**Files:**
- Modify: `index.html` — `.day-card` (lines ~1018-1061), `.class-item` (lines ~1081-1104), `.day-header` (lines ~1062-1077)

**Step 1: Update day card styles**

```css
.day-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  /* keep padding, min-height, transition, display, flex-direction */
}

.day-card:hover {
  box-shadow: var(--shadow-raised);
}

.day-card.today {
  border-left: 3px solid var(--primary);
  box-shadow: var(--shadow-rest);
}

.day-card.has-classes {
  background: rgba(107,91,138,0.03);
  border-color: rgba(107,91,138,0.12);
}

.day-card.today.has-classes {
  border-left-color: var(--primary);
}

.day-card.empty {
  background: var(--surface-hover);
}
```

Remove `transform: translateY(-2px)` from day-card hover.

**Step 2: Update day header**

```css
.day-header {
  /* keep layout */
  border-bottom: 1px solid var(--border);
}

.day-name { color: var(--ink); }
.day-date { color: var(--secondary-text); }
```

**Step 3: Update class items**

```css
.class-item {
  background: var(--surface-hover);
  border-radius: 8px;
  padding: 8px 8px 8px 12px;
  margin-bottom: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all .2s ease;
  border-left: 3px solid var(--border-strong);
}

.class-item.status-draft-bar { border-left-color: var(--warning); }
.class-item.status-finalized-bar { border-left-color: var(--success); }

.class-item:hover {
  background: #EFEDEA;
  transform: translateX(2px);
}

.class-time { font-weight: 600; color: var(--primary); }
.class-info { color: var(--ink-light); font-size: 12px; margin-top: 2px; }
```

**Step 4: Verify — Weekly Planner calendar grid**

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: light theme calendar day cards and class items"
```

---

### Task 12: Guest Cards & Avatars

**Files:**
- Modify: `index.html` — `.guest-card` (lines ~1126-1189), `.guest-avatar` (line ~1149), and the JS `renderGuests()` function for avatar color hashing

**Step 1: Update guest card styles**

```css
.guest-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.guest-card:hover {
  box-shadow: var(--shadow-raised);
}

.guest-info h4 { color: var(--ink); }
.guest-info p { color: var(--secondary-text); }
```

**Step 2: Update guest avatar with hashed colors**

Replace the single gold gradient avatar with a hash-based color system. In the CSS:

```css
.guest-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 18px; color: #fff;
  /* background set inline via JS */
}
```

In the JS `renderGuests()` function (or wherever avatars are generated), add a helper:

```javascript
function avatarColor(name) {
  const colors = [
    '#9B8EC4', // lavender
    '#7BA688', // sage
    '#C49B9B', // blush
    '#7A9DB8', // sky
    '#C4B08A', // sand
    '#C4956B', // peach
    '#7ABBA6', // mint
    '#8B9BA8', // slate
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
```

Apply inline: `style="background: ${avatarColor(guest)}"`

**Step 3: Update guest stat boxes**

```css
.guest-stat {
  background: var(--surface-hover);
  /* keep layout */
}

.guest-stat .value { color: var(--primary); }
.guest-stat .label { color: var(--secondary-text); }
```

**Step 4: Verify — Guests tab with profile cards**

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: light theme guest cards with hashed avatar colors"
```

---

### Task 13: Tooltips, Toasts & Empty States

**Files:**
- Modify: `index.html` — `.info-tip` (lines ~416-457), `.tooltip-wrapper` (lines ~458-489), `.toast` (lines ~1589-1617), `.empty-state` (lines ~1476-1498)

**Step 1: Update tooltips**

```css
.info-tip .tip-text {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-floating);
  color: var(--cream);
}

.info-tip .tip-text::after {
  border-top-color: var(--border-strong);
}
```

Same pattern for `.tooltip-wrapper .tooltip-text`.

**Step 2: Update toasts**

```css
.toast {
  background: var(--surface);
  color: var(--cream);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-floating);
  border-left: 3px solid var(--primary);
}

.toast.success { border-left-color: var(--success); }
.toast.error { border-left-color: var(--danger); }
.toast.info { border-left-color: var(--info); }
```

**Step 3: Update empty states**

```css
.empty-state { color: var(--secondary-text); }
.empty-state h3 { color: var(--ink-light); }
```

**Step 4: Verify — trigger a toast, check tooltips on metric labels, check empty states**

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: light theme tooltips, toasts, and empty states"
```

---

### Task 14: Remaining Hardcoded Colors & Inline Styles

**Files:**
- Modify: `index.html` — sweep for remaining `rgba(201,161,93,...)`, `rgba(255,255,255,...)` on dark backgrounds, `#fff` text on dark bg, `rgba(0,0,0,.2)` on dark bg references

**Step 1: Search and replace remaining gold accent references**

Find all remaining `rgba(201,161,93` and replace with appropriate indigo equivalents:
- `rgba(201,161,93,.12)` → `rgba(107,91,138,0.08)`
- `rgba(201,161,93,.18)` → `rgba(107,91,138,0.10)`
- `rgba(201,161,93,.28)` → `rgba(107,91,138,0.12)`
- `rgba(201,161,93,.35)` → `rgba(107,91,138,0.15)`
- `rgba(201,161,93,.55)` → `rgba(107,91,138,0.20)`

**Step 2: Replace remaining dark-theme white overlays**

Find all remaining `rgba(255,255,255,.06)` through `.12` used as backgrounds and replace:
- Background uses → `var(--surface)` or `var(--surface-hover)` or `var(--surface-secondary)`
- Border uses → `var(--border)` or `var(--border-strong)`

**Step 3: Replace remaining `color: #fff` or `color: rgba(255,255,255,...)` text**

- `color: #fff` (on non-button elements) → `color: var(--ink)` or `color: var(--cream)`
- `color: rgba(255,255,255,.7)` → `color: var(--secondary-text)`
- `color: rgba(255,255,255,.8)` → `color: var(--ink-light)`
- `color: rgba(255,255,255,.9)` → `color: var(--cream)`
- `color: rgba(255,255,255,.5)` → `color: var(--secondary-text)`

**Step 4: Replace remaining dark bg overlays**

- `background: rgba(0,0,0,.1)` through `.2` → `var(--surface-hover)` or `var(--surface-secondary)`
- `background: rgba(0,0,0,.15)` → `var(--surface-hover)`
- `rgba(28, 45, 38, ...)` and `rgba(20, 34, 28, ...)` → appropriate light values
- `rgba(13, 21, 18, ...)` → `var(--surface)` (tooltips already handled)

**Step 5: Check inline styles in HTML**

Several elements have inline `style=` attributes with dark-theme colors (especially in Settings tab). These need JS or CSS override treatment.

**Step 6: Full visual sweep — check every tab thoroughly**

**Step 7: Commit**

```bash
git add index.html
git commit -m "feat: sweep remaining hardcoded dark theme colors"
```

---

### Task 15: Typography & Spacing Refinements

**Files:**
- Modify: `index.html` — various typography and spacing properties

**Step 1: Update section headers**

```css
.section-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: var(--ink);
}
```

**Step 2: Adjust spacing values**

- Card `.body` padding: `24px` (already done in Task 4)
- `--gap`: `28px` (already done in Task 1)
- Stats bar: `padding: 14px 20px`
- Table cells: `padding: 14px 20px` (already done in Task 7)

**Step 3: Verify typography hierarchy across all tabs**

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: typography and spacing refinements"
```

---

### Task 16: Final Visual Verification & Polish

**Files:**
- Modify: `index.html` — any remaining issues found during verification

**Step 1: Open app in Playwright and take screenshots of every tab**

Capture: Dashboard, Weekly Planner, Playlist Explorer, History, Guests, Settings

**Step 2: Check each tab for dark-theme artifacts**

Look for:
- Any remaining dark backgrounds
- White text on light backgrounds (invisible text)
- Gold/tan accent colors that should be indigo
- Heavy dark shadows
- Glass morphism rgba overlays still present
- Gradients that don't match light theme

**Step 3: Check modals**

Open Plan New Class modal, verify form inputs, buttons, backdrop

**Step 4: Check mobile responsive**

Resize to 375px width, verify nav, tab bar, cards, modals

**Step 5: Fix any issues found**

**Step 6: Final commit**

```bash
git add index.html
git commit -m "fix: final polish pass — resolve remaining theme artifacts"
```

---

## Summary

| Task | Scope | Est. Lines Changed |
|------|-------|-------------------|
| 1 | Foundation (variables, page base, manifest) | ~30 |
| 2 | Navigation & tab bar | ~40 |
| 3 | Hero sections | ~15 |
| 4 | Cards & primary card | ~25 |
| 5 | Buttons (all variants) | ~50 |
| 6 | Pills, status indicators, tags | ~45 |
| 7 | Tables & sortable headers | ~30 |
| 8 | Modals | ~30 |
| 9 | Metrics, step labels, best summary | ~25 |
| 10 | Form inputs, search, stats bar | ~30 |
| 11 | Calendar day cards & class items | ~35 |
| 12 | Guest cards & avatars (+ JS helper) | ~25 |
| 13 | Tooltips, toasts, empty states | ~25 |
| 14 | Remaining hardcoded colors sweep | ~50+ |
| 15 | Typography & spacing | ~15 |
| 16 | Visual verification & polish | Variable |
| **Total** | | **~470+ lines** |

**Files changed:** `index.html`, `manifest.json`, `sw.js`
