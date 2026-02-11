# HiLo App Improvements — Implementation Plan

## Change 1: Auto-clear search bar and refocus after guest selection (Planner modal)

**Problem:** When selecting a guest name while building a class in the planner, the search bar retains whatever was typed and doesn't refocus. The instructor has to manually clear and re-click the search field for each guest.

**Files:** `index.html`

**Implementation:**

1. **Modify `populateModalGuestList()`** (line 3239 click handler): After toggling a guest in/out of `state.modalAttendees`, clear the search input value (`$('#modal-guest-search').value = ''`), reset all guest list items to visible (`item.style.display = ''`), and refocus the search input (`$('#modal-guest-search').focus()`).

2. **Also update the clear button state**: After clearing search text, hide the clear button by removing the `visible` class from `#modal-guest-search-clear`.

**Why this approach:** This keeps the flow tight — tap a name, search resets, cursor is back in the field ready for the next search. No extra DOM restructuring needed.

---

## Change 2: Reposition selected guests below the guest list (Planner modal)

**Problem:** Selected guest chips appear above the searchable guest list, pushing the list down and obscuring the search results as more guests are selected.

**Files:** `index.html`

**Implementation:**

1. **Move the `selected-guests-container` div** (lines 2045-2049) from its current position (between the search bar and the guest list) to **after** the `guest-list-container` div (after line 2053). This way the DOM order becomes:
   - Search bar + actions
   - Guest list (scrollable)
   - Selected guests chips (below)

2. **Adjust CSS for `.selected-guests-container`**: Add `max-height: 150px; overflow-y: auto;` so that even with many selected guests, the container doesn't grow unbounded and push the modal off-screen.

**Why this approach:** Moving selected chips below the search results means the search results stay stable and visible. The selected guests are still accessible for review/removal but don't interfere with the active search workflow.

---

## Change 3: Remove magnifying glass icon from guest search field

**Problem:** The magnifying glass emoji (`🔍`) in the search field is unwanted on the modal guest search.

**Files:** `index.html`

**Implementation:**

1. **Create a new CSS class** `.search-container.no-icon` that overrides `::before { content: none; }` and adjusts input padding-left from `40px` back to `12px`.

2. **Add `no-icon` class** to the modal guest search container div at line 2035.

**Why this approach:** Targeted override rather than removing the icon globally (other search fields like history/guests tabs may still want it). Clean CSS-only solution.

---

## Change 4: Time selector in 15-minute increments

**Problem:** The native `<input type="time">` shows every minute, which is unnecessarily granular for class scheduling.

**Files:** `index.html`

**Implementation:**

1. **Replace `<input type="time">` with `<select>`** at line 2020. Add the `step` attribute won't work reliably across browsers (especially iOS Safari), so a `<select>` dropdown is the right approach for a PWA targeting iOS.

2. **Generate time options** in 15-minute increments from 5:00 AM to 10:00 PM (typical fitness class hours): `05:00, 05:15, 05:30, 05:45, 06:00, ... 22:00`. Each `<option>` will display in 12-hour format (e.g., "5:00 AM", "9:15 AM", "2:30 PM") with the value in 24-hour format ("05:00", "09:15", "14:30").

3. **Create a helper function `generateTimeOptions()`** that returns the HTML string for all `<option>` elements. This will be called once during initialization and injected into the select.

4. **Update `openClassModal()`** (line 3202) and **`openNewClassModal()`** (line 3184) to set the `<select>` value to the nearest 15-minute increment (rounding to nearest via `Math.round(minutes / 15) * 15`).

5. **Update `normalizeTime()`** references in `handleModalSave()` and `handleModalFinalize()` to read from the new select element (same ID `modal-class-time`, so selectors remain the same).

**Why this approach:** A `<select>` dropdown gives consistent behavior across all browsers/iOS PWA. The `step` attribute on `<input type="time">` is inconsistently supported, particularly on mobile Safari where this app is primarily used.

---

## Change 5: Playlist tag assignment via dropdown instead of free-text

**Problem:** Currently tags are typed into a text input with autocomplete suggestions. The request is for a proper dropdown with predefined class types as the default options.

**Files:** `index.html`

**Implementation:**

1. **Replace the tag input + autocomplete system** in `buildTagEditorHTML()` (line 3631-3634) with a `<select>` dropdown. The dropdown will list all class types from `PREDEFINED_CLASS_TYPES` (Yoga, Pilates, Spin, HIIT, Strength, Stretch, Dance, Barre) plus any custom types already in use (from `getAllClassTypes()`), excluding tags already applied to this playlist.

2. **Update `buildTagEditorHTML()`**: Replace the `tag-input-wrapper` div with a `<select>` element with class `tag-select`. Include a disabled placeholder option "Add class type...". Each available type becomes an `<option>`.

3. **Simplify `wireTagEditor()`** (lines 3637-3708): Remove the autocomplete logic (focus, input, keydown for arrow nav, blur). Replace with a simple `change` event listener on the `<select>`: on change, call `addPlaylistTag(playlistNum, select.value)`, then reset the select to the placeholder.

4. **Keep the existing chip display and remove buttons** — those stay the same.

**Why this approach:** A native `<select>` is more intuitive on mobile/iOS, requires fewer taps than typing, and eliminates the possibility of typos. The predefined class types ensure consistency across playlists.

---

## Change 6: Multi-class selection and batch playlist assignment in Recommender

**Problem:** Currently the recommender only allows selecting one planned class at a time. The instructor wants to select multiple classes and assign a single playlist to all of them at once.

**Files:** `index.html`

**Implementation:**

### State Changes
1. **Add `state.selectedRecommendationClassKeys`** (Set) alongside the existing `state.selectedRecommendationClassKey` (string). The Set will track multiple selected keys.

### HTML Changes
2. **Replace the single `<select>` dropdown** (`#plannedClassSelector`, lines 1801-1803) with a **scrollable checkbox list** inside a styled container. Each planned class gets a checkbox + label row. This is more mobile-friendly than a `<select multiple>` which has poor UX on iOS.

3. **Add a "Select All Drafts" / "Clear All" toggle** above the class list for convenience.

4. **Update the info pills** (lines 1812-1817) to show aggregate info when multiple classes are selected (e.g., "3 classes selected", combined unique attendee count).

### JavaScript Changes
5. **Update `populatePlannedClassSelector()`** to render checkboxes instead of `<option>` elements. Each checkbox's change handler toggles the class key in `state.selectedRecommendationClassKeys`.

6. **Create `getSelectedRecommenderClassEntries()` (plural)** that returns an array of all selected class entries. For metrics computation, merge all attendees from selected classes into a single Set, and use the earliest class date as the reference date. If all selected classes share the same classType, use that for filtering; otherwise use no classType filter.

7. **Update `getMetricsForSelectedClass()`** to call the new multi-entry function. It will compute metrics using the merged attendee list.

8. **Update `refreshDashboard()`**:
   - Summary shows "N classes selected" with merged roster size
   - "Assign Best Playlist" button assigns to ALL selected draft classes
   - Individual "Assign" buttons in the rankings table also assign to all selected classes

9. **Update `assignPlaylistToSelectedClass()`** → rename to `assignPlaylistToSelectedClasses()`: loop over all selected class entries, assign the playlist to each one, batch the Firestore writes.

10. **Auto-select behavior**: When no classes are explicitly selected, auto-select the next upcoming draft (preserving current behavior for single-class workflows).

**Why this approach:** A checkbox list gives clear multi-select UX on mobile. Merging attendees for recommendations makes sense — if the same guests attend multiple classes, the freshness scoring accounts for all of them. Batch assignment is the natural action after seeing a recommendation for multiple classes.

---

## Change 7: Case-insensitive class type filtering for recommendations

**Problem:** `computeMetrics()` at line 3307 uses `tags.includes(classTypeFilter)` which is case-sensitive. If a tag is "yoga" but the class type is "Yoga", it won't match.

**Files:** `index.html`

**Implementation:**

1. **Update the filter in `computeMetrics()`** (line 3307): Change from:
   ```js
   return tags.includes(classTypeFilter);
   ```
   to:
   ```js
   const filterLower = classTypeFilter.toLowerCase();
   return tags.some(t => t.toLowerCase() === filterLower);
   ```

2. **Move the `toLowerCase()` call on `classTypeFilter` outside the `filter()` loop** for efficiency — compute it once before the `.filter()` on line 3302.

**Why this approach:** Minimal, surgical fix. The tags and class types stay as-is (preserving display casing), but comparison is case-insensitive. No data migration needed.

---

## Implementation Order

1. **Change 7** — Case-insensitive filtering (smallest, no UI changes, reduces friction immediately)
2. **Change 3** — Remove magnifying glass (CSS-only, quick win)
3. **Change 4** — Time selector in 15-min increments (HTML + JS, self-contained)
4. **Change 1** — Auto-clear search + refocus (JS behavior in modal)
5. **Change 2** — Reposition selected guests (HTML/CSS layout in modal)
6. **Change 5** — Tag dropdown (replaces existing tag editor)
7. **Change 6** — Multi-class recommender (largest change, builds on all above)

## Testing Considerations

- All changes are in `index.html` (single-file PWA, no build step)
- Test on iOS Safari (PWA mode) since that's the primary target
- Verify Firestore sync still works after batch assignment changes
- Confirm offline/localStorage fallback works for all new features
- Test with edge cases: no guests, no playlists tagged, mixed case tags, 0 planned classes
