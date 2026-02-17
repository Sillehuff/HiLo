# Plan: Drag-and-Drop Reordering for Selected Guest Chips

## Context

In the "Plan New Class" modal, selected guests appear as gold pill-shaped chips in the `#modal-selected-guests` container. Currently:
- `state.modalAttendees` is a **Set** (unordered)
- Guests are always rendered in **alphabetical order** via `.sort()`
- There is **no drag-and-drop functionality**

The goal is to let the instructor drag-and-drop these chips to reorder them, and have that custom order persist through save/finalize.

---

## Step 1: Convert `state.modalAttendees` from `Set` to `Array`

The Set data structure doesn't support ordering. We need to switch to an Array while preserving uniqueness manually.

**Changes required in `index.html`:**

- **State initialization** (~line 2284): Change `modalAttendees: new Set()` → `modalAttendees: []`
- **`openNewClassModal()`** (~line 3425): Change `state.modalAttendees = new Set()` → `state.modalAttendees = []`
- **`openClassModal()`** (~line 3443): Change `state.modalAttendees = new Set(classData.attendees)` → `state.modalAttendees = [...(classData.attendees || [])]`
- **Guest click handler** (~line 3536): Replace `.has()` / `.delete()` / `.add()` with array equivalents:
  - `.has(guest)` → `.includes(guest)`
  - `.delete(guest)` → `.splice(.indexOf(guest), 1)` or `.filter()`
  - `.add(guest)` → `.push(guest)` (with uniqueness check)
- **`renderModalSelectedGuests()`** (~line 3571): Remove the `.sort()` call so the array order is respected
- **Remove-guest click handler** (~line 3582): Replace `state.modalAttendees.delete(name)` with array removal
- **`updateModalGuestListSelection()`** (~line 3592): Replace `.has()` with `.includes()`
- **`handleModalSave()`** (~line 4526): Replace `new Set(state.modalAttendees)` with `[...state.modalAttendees]`
- **`handleModalFinalize()`** (~line 4596):
  - Replace `state.modalAttendees.size === 0` with `.length === 0`
  - Replace `new Set(state.modalAttendees)` with `[...state.modalAttendees]`
  - Replace `Array.from(attendees)` with the array directly
- **Any other `.size` references**: Replace with `.length`
- **"Clear All" button handler**: Replace `state.modalAttendees.clear()` or `= new Set()` with `state.modalAttendees = []`

All uniqueness checks that the Set provided for free must be added manually (check `.includes()` before `.push()`).

---

## Step 2: Implement Drag-and-Drop on Selected Guest Chips

Since this is a no-build-tools PWA, we'll use the **HTML5 Drag and Drop API** for desktop and **touch event listeners** for mobile/tablet (important since this is a PWA used on phones).

### 2a: HTML Changes in `renderModalSelectedGuests()`

For each chip element:
- Add `draggable="true"` attribute
- Add a drag handle indicator (e.g., `⠿` or `≡` icon) before the guest name
- Store the guest name as `data-guest` on the chip (already exists) and `data-index`

### 2b: CSS Additions

Add styles for:
- `.selected-guest-item[draggable]` — `cursor: grab`
- `.selected-guest-item.dragging` — reduced opacity, outline/border change to indicate the item being dragged
- `.selected-guest-item.drag-over` — visual indicator for the drop target position (e.g., left/bottom border highlight or expanded gap)
- `.drag-handle` — styling for the grip icon (subtle, small, cursor: grab)
- Touch-specific: ensure adequate touch target size (already ≥28px on chips)

### 2c: Desktop Drag Events (HTML5 DnD API)

Attach to each chip in `renderModalSelectedGuests()`:
- **`dragstart`**: Store the dragged guest name/index; add `.dragging` class; set `dataTransfer` data
- **`dragend`**: Remove `.dragging` class; clean up all `.drag-over` classes
- **`dragover`**: `e.preventDefault()` (to allow drop); add `.drag-over` class to the hovered chip
- **`dragleave`**: Remove `.drag-over` class
- **`drop`**: Reorder `state.modalAttendees` array (splice from old index, splice into new index); call `renderModalSelectedGuests()` to re-render

### 2d: Mobile Touch Events

HTML5 Drag and Drop doesn't work on mobile. Implement touch-based reordering:
- **`touchstart`** on drag handle: Record the starting chip and position; after a brief hold (~150ms), begin drag mode — add `.dragging` class, create a floating visual clone that follows the finger
- **`touchmove`**: Move the visual clone to follow touch coordinates; use `document.elementFromPoint()` to find which chip is under the finger; show `.drag-over` indicator on that target
- **`touchend`**: Reorder the array based on the drop position; remove clone element; call `renderModalSelectedGuests()` to re-render
- **`touchcancel`**: Clean up without reordering

Use a small hold delay or restrict drag initiation to the handle to differentiate drag from scroll (the container has `overflow-y: auto` for many guests).

---

## Step 3: Preserve Order Through Save and Finalize

Since we're converting from Set to Array, the order naturally flows through the existing save paths:

- **`handleModalSave()`**: Already converts to array for Firestore — now that array will reflect the drag-drop order instead of alphabetical
- **`handleModalFinalize()`**: Same — attendees array written to Firestore/localStorage preserves custom order
- **`openClassModal()` (edit existing)**: When reopening a saved class, `classData.attendees` is already an array in the saved order, so `[...classData.attendees]` preserves it

No additional changes needed beyond what Step 1 covers.

---

## Step 4: Test and Verify

- Desktop: drag a chip and drop it at a different position — order updates
- Mobile: touch-hold a chip handle and drag to reorder
- Remove a guest (× button) — remaining order preserved
- Add a new guest — appends to end of the list
- Save draft, reopen modal — custom order preserved
- Finalize class — order reflected in saved data
- "Clear All" still works
- Search + select still appends new guest at end

---

## Summary of Files Changed

| File | Changes |
|------|---------|
| `index.html` | Convert Set→Array in all `modalAttendees` usage, add drag-and-drop JS event handlers, add CSS for drag states, add drag handle to chip rendering |

No other files need changes — this is a single-file PWA with no dependencies.

## Risks / Considerations

- **Backward compatibility**: Existing saved classes store attendees as arrays in Firestore, so switching from Set to Array on the JS side is fully compatible — no migration needed.
- **No external libraries**: Everything is vanilla JS to maintain the no-dependency architecture.
- **Touch vs. scroll conflict**: The selected-guests container has `max-height: 150px` with `overflow-y: auto`. Restricting touch-drag initiation to the drag handle icon avoids conflicting with container scrolling.
- **Accessibility**: Chips remain keyboard-focusable. Keyboard reorder (e.g., Alt+Arrow keys) could be a future enhancement but is out of scope for this initial implementation.
