# Surgical Consolidation - Simplification Design

**Date:** 2026-02-25
**Approach:** Consolidate duplicated patterns, shrink large functions, remove CSS redundancy
**Target:** ~400-600 line reduction while preserving all features
**Constraint:** Stay single-file (index.html)

## Changes

### 1. Consolidate Playlist Metadata Functions (~40 lines saved)
Merge `setPlaylistStatus()`, `addPlaylistTag()`, `removePlaylistTag()` into a single `updatePlaylistMetadata(id, changes)` that delegates to `upsertPlaylistMetadata()`.

### 2. Extract Batch Firestore Helper (~60 lines saved)
Create `runFirestoreBatch(ops)` accepting `{action, ref, data}` objects. Replace manual batch patterns in `handleModalSave`, `handleModalFinalize`, `finalizeDayDrafts`, `handleCsvImport`.

### 3. Split `addEventListeners()` (~0 lines saved, readability improvement)
Break 335-line function into: `wireNavEvents()`, `wireDashboardEvents()`, `wirePlannerEvents()`, `wireModalEvents()`, `wireSettingsEvents()`.

### 4. Simplify `showAddGuestPrompt()` (~80 lines saved)
Replace manual DOM creation with innerHTML template + event wiring.

### 5. Consolidate Table Rendering (~60 lines saved)
Extract `buildTableHTML(headers, rows, opts)` helper used by `refreshHistory()` and `refreshExplorer()`.

### 6. CSS Cleanup (~100-150 lines saved)
Remove duplicate mobile overrides, consolidate similar selectors, remove unused rules.

### 7. Simplify `renderModalSelectedGuests()` (~60 lines saved)
Extract drag-and-drop handler setup into `setupDragReorder(container, onReorder)` utility.

## Execution
Each change applied sequentially by code-simplifier agents, verified after each step.
