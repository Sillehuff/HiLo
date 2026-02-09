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

1. **Dashboard** — select date/time/guests, get best playlist recommendation via freshness scoring
2. **Weekly Planner** — 7-day calendar grid, create/edit/finalize classes
3. **Playlist Explorer** — sortable table of all playlists with staleness metrics, inline tag editor
4. **History** — finalized class log grouped by date, sortable
5. **Guests** — profile cards with per-guest attendance stats
6. **Settings** — account info, CSV import/export, clear data

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
- Constants: `DEFAULT_PLAYLISTS` (1-12), `PREDEFINED_CLASS_TYPES` (Yoga, Pilates, Spin, HIIT, Strength, Stretch, Dance, Barre)

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

Cache version is `hilo-playlist-v3`. Bump this constant in `sw.js` when making changes to force cache refresh. Firebase/Google API requests are excluded from caching.
