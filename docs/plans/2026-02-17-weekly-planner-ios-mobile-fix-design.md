# Weekly Planner iOS Mobile Fix

## Problems

1. **Cramped day/date text** — Empty day cards show "Sunday2/15" with no space between day name and date
2. **Week date range placement** — Date range pill sits on its own full-width row above nav buttons, wasting vertical space and looking disconnected

## Fix 1: Day/Date Spacing

Add `gap: 6px` to `.day-card.empty .day-header` in base CSS. The empty card layout uses `flex-direction: row` on the day-header, but no gap is specified, causing the day-name and day-date divs to render flush against each other.

**File:** `index.html`
**Location:** `.day-card.empty .day-header` rule (~line 1035)
**Change:** Add `gap: 6px`

## Fix 2: Inline Date Range with Nav Buttons

Remove mobile overrides that force `#weekRangePill` to full-width on its own row. Let it sit inline between Prev and Next buttons in the natural flex flow.

**File:** `index.html`
**Location:** Mobile media query `#weekRangePill` rule (~line 1814)
**Change:** Remove `width: 100%`, `justify-content: center`, and `order: -1`

**Result:** Banner becomes `← Prev | Feb 15 – Feb 21 | Current | Next →` on one row, plus status pills on a second row. Saves ~30px vertical space.

## Scope

CSS-only changes. No HTML or JS modifications.
