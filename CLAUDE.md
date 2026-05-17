# HiLo Playlist App V2

Fitness class playlist planner for instructors. Recommends the "freshest" playlist based on guest attendance history.

## Architecture

Single-file PWA — no build tools, no framework, no bundler.

- `index.html` — all HTML, CSS, and JS in one file
- `sw.js` — service worker (stale-while-revalidate caching, excludes Firebase domains)
- `manifest.json` — PWA manifest
- `icons/` — app icons (SVG, PNG 192/512, apple-touch-icon)

Firebase compat SDK v11.3.0 loaded via CDN. No npm dependencies.

## Firebase

- **Project**: `hilo-playlist-app`
- **Auth**: Google sign-in (popup, redirect fallback for iOS PWA)
- **Database**: Firestore with offline persistence (`synchronizeTabs: true`)

### Firestore Collections

All under `/users/{uid}/`:

| Collection | Doc ID | Fields |
|---|---|---|
| `records` | `safeDocId(recordKey)` | date, time, guest, playlist, recordKey |
| `classes` | `safeDocId(dateTimeKey)` | date, time, playlist, attendees[], status, notes, dateTimeKey |
| `playlists` | `"1"` .. `"12"` | classTypes: string[], status: "Active"\|"Retired" |

`safeDocId()` uses FNV-1a hash for deterministic, collision-safe document IDs.

## Key State

```
state.records           — attendance history array
state.weeklyPlan        — Map<dateTimeKey, classObject>
state.playlistTags      — Map<playlistId, string[]>
state.playlistStatus    — Map<playlistId, "Active"|"Retired">
state.allGuests         — Set of all guest names
state.attendees         — Set of currently selected guests (dashboard)
state.firebaseUser      — current auth user (null if signed out)
state.unsubRecords/Classes/Playlists — Firestore listener teardown functions
```

## UI Tabs

Mobile-first 4-tab IA:

1. **Schedule** — continuous-scroll agenda (past 7 days through next 5 weeks), sticky week strip with day-letter cells and IntersectionObserver-driven week label, inline-expand class panel (rec card + type/time/notes fields → openClassEditSheet, real per-guest last-heard via `lastHeardMap`, save-draft/finalize/delete). Header has a sparkle button that pushes the Recommender onto Schedule's nav stack. FAB opens openAddClassSheet.
2. **Guests** — searchable list, "+ Add Guest" sheet, tap a card → Guest Detail (pushed) with hero, stats, last class, playlist history, and pencil/trash in nav bar for `renameGuest` / `deleteGuest`.
3. **History** — search + class-type filter chips + sort menu (Date/Type/Playlist/Attendees, asc/desc). Only finalized classes. Week-grouped when sort key is date, flat list otherwise. Tap entry → openClassEditSheet (same sheet as Schedule). Stats footer (Total Classes / Unique Guests / Playlists Used).
4. **More** — profile card, Tools (Recommender, Playlists), Account (Settings).

**Recommender** (pushed): multi-select class pills + "Select All Drafts" + "Clear" + Replay window control + best card with reasons + collapsible "All attendees (N)" + ranked list + sticky assign-to-all action bar. Preserves the multi-class same-type same-day flow via `getMetricsForSelectedClasses` over merged attendees.

**Playlists** (pushed under More): Active/Retired summary, list with inline status toggle, tap row → openTagEditorSheet (custom tags + remove confirm). "Removed" is a third hidden status reachable only via tag editor.

**Settings** (pushed under More): account card, sync pill, cosmetic Notifications + Auto-finalize toggles (persist to localStorage, no functional behavior), Replay window selector, Import/Export CSV, Clear All Data with in-sheet confirm.

## Navigation

Per-tab navigation stack: `state.nav.stacks = { schedule:[], guests:[], history:[], more:[] }`. `navPush(screen, params)` / `navPop()` / `navSwitch(tab)`. Tab bar hidden when current tab's stack depth > 0.

## Bottom Sheet Portal

A single `#sheet-layer` div sits at the body root (avoids `.hilo-scroll` clipping). Sheets stack via `state.sheetStack` with z-index per depth. Six builders: `openPlaylistPickerSheet`, `openAddClassSheet`, `openClassEditSheet`, `openAddGuestSheet`, `openTagEditorSheet`, `openSortMenuSheet`. Destructive actions (delete class, remove playlist, clear data, delete guest) use in-sheet confirm views — never native `confirm()`.

## DOM Coupling

The old `addEventListeners()` / `wireXxxEvents()` pattern with `$('#id')` references was dropped during the redesign. Per-screen wiring is now done inside `renderXxxScreen()` functions via closure capture on freshly-rendered nodes. Data-layer functions (`saveClassToFirestore`, `computeMetrics`, etc.) don't touch DOM and are reused verbatim.

## Cosmetic Stubs

Some UI elements render but have no functional logic — placeholders for future work:
- Notifications toggle (Settings) — persists to localStorage; no Web Push wiring
- Auto-finalize toggle (Settings) — persists to localStorage; no scheduler
- Guest "Active" badge (Guests list) — always shows "Active"
- "Member since —" (Guest Detail hero) — placeholder text

## Data Flow

- **Real-time listeners** (`onSnapshot`) replace polling. Firestore changes flow into local state automatically.
- **Dual persistence**: localStorage for offline/startup, Firestore for cloud sync when authenticated.
- **Batch writes**: class finalization atomically updates class status + writes one record per attendee. CSV import uses 500-doc chunked batches.

## Freshness Scoring

`computeMetrics()` calculates per-playlist:
- `stalePct` — % of guests who heard playlist within `selectedWindow` days (default 45)
- `neverPct` — % of guests who never heard it
- `medianDays` — median days since last heard
- **Score**: `(stalePct * 2) + (neverPct * 3) + (medianDays * 0.1)` — higher = fresher = better recommendation

## Conventions

- All user-generated content HTML-escaped via `esc()` before rendering
- Playlist IDs normalized: strip "Playlist #", handle decimals, numeric sort
- Guest names are case-preserved but matched case-sensitively
- CSS uses custom properties (`--primary`, `--accent`, `--cream`, etc.) with dark glass aesthetic
- Constants: `DEFAULT_PLAYLISTS` (1-12)

## Deployment

- Hosted on GitHub Pages: https://sillehuff.github.io/HiLo/
- Repo: https://github.com/Sillehuff/HiLo
- Auto-deploys on push to `main` via `.github/workflows/deploy.yml`
- Firebase authorized domain: `sillehuff.github.io`

## Development

Edit `index.html` directly and open in browser. No build step. To deploy:

```bash
git add -A && git commit -m "description" && git push origin main
```

GitHub Actions will deploy to Pages automatically.

## Service Worker

Cache version is `hilo-playlist-v15`. Bump this constant in `sw.js` when making changes to force cache refresh. The activate handler evicts old caches whose name doesn't match the current `CACHE_NAME`. Firebase/Google API requests are excluded from caching.
