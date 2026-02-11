# Plan: Class Planner Modal Improvements

All changes are in `index.html`. Five items.

---

## 1. Fix frozen Finalize / Save Draft / Cancel buttons

**Root cause:** On mobile (≤768px), the `.form-row` collapses to a single column, stacking date and time vertically. Combined with the guest selector (200px list + selected chips + search bar), the modal body content exceeds the flex container's `max-height`. The `.modal__body` lacks `min-height: 0`, so flexbox cannot shrink it below its intrinsic content size — the footer gets pushed off-screen or becomes unresponsive.

**Fix (CSS, ~lines 1160-1171 and ~1683-1691):**
- Add `min-height: 0; flex: 1 1 0;` to `.modal__body` so it properly shrinks and scrolls within the flex column.
- Remove `position: sticky` from the mobile `.modal__footer` — it's a no-op (scroll is on `.modal__body`, not the parent flex container) and can cause stacking issues on iOS Safari.
- Add `position: relative; z-index: 1;` to `.modal__footer` so it always layers above body overflow.

---

## 2. Enter/Return selects a single remaining search result

**Behavior:** When the user types in the guest search and only one guest is visible in the filtered list, pressing Enter toggles that guest's selection, then clears the search — same flow as tapping the guest name.

**Fix (JS, add after ~line 4122):**
- Add a `keydown` event listener on `#modal-guest-search`.
- On `Enter`: query all `.guest-list-item` with `display !== 'none'`. If exactly one exists, fire its click handler (toggle selection + clear search + refocus).
- Call `e.preventDefault()` to suppress any form submission.

---

## 3. Default quick-tap list to recent guests (last 90 days)

**Behavior:** When the search field is empty, only guests who attended a class within the last 90 days appear for quick-tap. When the user types a search term, *all* matching guests appear (including inactive), so anyone can still be found.

**Fix (JS, ~lines 3340-3367 and ~4114-4122):**
- In `populateModalGuestList()`: for each guest, compute days since their most recent record in `state.records`. Store as `data-last-seen-days` attribute on the element (or `"never"` if no records).
- Create a helper `filterModalGuestVisibility()` that: if search is empty, hides guests with `lastSeenDays > 90` or no records; if search has text, shows all guests matching the term.
- Call this helper from: the `input` listener, the search-clear callback, and after a guest is clicked (replacing the current "show all" logic).

---

## 4. Remove "Select All" button, widen search bar

**Fix (HTML, ~lines 2047-2055):**
- Remove `<button id="modalSelectAllBtn">Select All</button>`.
- Remove the `.guest-selector-actions` wrapper div. Place the "Clear All" button directly in `.guest-selector-header` alongside the search container.

**Fix (CSS, ~lines 1385-1395):**
- The search container already has `flex: 1` — with the actions div removed, it will naturally expand.
- Style the Clear All button to sit compactly at the end of the header row.

**Fix (JS, ~lines 4292-4301):**
- Remove the `$('#modalSelectAllBtn')` event listener block.

---

## 5. Date and Time on one row (even on mobile)

**Behavior:** Date and Time inputs share a single row in the modal regardless of screen width. This reclaims vertical space for the guest selector.

**Fix (HTML, ~line 2026):**
- Add a modifier class `form-row--always-inline` to the date/time `.form-row` element.

**Fix (CSS, add near ~line 1321):**
- `.form-row--always-inline { grid-template-columns: 1fr 1fr !important; }` — overrides the mobile `1fr` collapse for this specific row.

---

## Implementation order

1. **Item 5** — Date/Time row (simplest CSS/HTML tweak)
2. **Item 4** — Remove Select All (straightforward removal)
3. **Item 1** — Fix frozen buttons (CSS layout fix)
4. **Item 3** — 90-day guest filter (JS logic in guest list)
5. **Item 2** — Enter to select (small JS addition)

All changes confined to `index.html`. No new files needed.
