# Pull-Up Counter (PWA)

A mobile-first Progressive Web App for tracking pull-up workouts with simple, reliable flows. Built with React + TypeScript + Vite, TailwindCSS for styling, Zustand for state, and `vite-plugin-pwa` for installability.

This README is designed to help developers, LLMs, and AI agents ramp up quickly to add features, fix bugs, and implement changes confidently.


## Project Overview

- Purpose: Track pull-up sessions with sets, variations (bodyweight/weighted/band), rest timing, and personal records.
- Form factor: Phone-first, single-column layout, large touch targets, bottom navigation.
- Persistence: Client-side via `localStorage` with a typed service layer.
- Installability: PWA with offline support and auto-updating service worker.


## Tech Stack

- Runtime: React 18, TypeScript
- Build: Vite 6
- State: Zustand (`src/store/index.ts`)
- UI: TailwindCSS 3 (`src/index.css`, `tailwind.config.js`)
- Router: `react-router-dom`
- PWA: `vite-plugin-pwa` (`vite.config.ts` + `virtual:pwa-register` in `src/main.tsx`)
- Icons/Toasts: `lucide-react`, `sonner`


## Architecture

- Routing (`src/App.tsx`):
  - `/` Home
  - `/workout` Active session
  - `/history` Completed sessions
  - `/progress` Stats/records
  - `/settings` App configuration
- State (`src/store/index.ts`):
  - `sessions: WorkoutSession[]`
  - `personalRecords: PersonalRecord[]`
  - `settings: AppSettings`
  - `activeSession: WorkoutSession | null`
  - Actions: `loadData`, `setActiveSession`, `saveSession`, `deleteSession`, `updatePersonalRecord`, `updateSettings`, `setCurrentPage`
- Persistence (`src/services/storage.ts`):
  - `LocalStorageService` singleton abstracts `get/save/deleteSession`, `get/saveActiveSession`, `get/updatePersonalRecord`, `get/saveSettings`, import/export utilities.
  - Dates are rehydrated on read.
- Types (`src/types/index.ts`): Canonical models for `ExerciseSet`, `WorkoutSession`, `PersonalRecord`, `AppSettings`.
- UI Components:
  - `components/Navigation.tsx`: Bottom navigation
  - `components/SetModal.tsx`: Add/edit set with reps/weight/band/RPE chips and input
- Pages:
  - `pages/HomePage.tsx`: Quick stats, Quick Session shortcut, new session modal trigger, recent sessions
  - `pages/WorkoutPage.tsx`: Current session header, set list, add/edit set modal, rest timer, complete session
  - `pages/HistoryPage.tsx`: Grouped history with session metrics and set details
  - `pages/ProgressPage.tsx`: Weekly/monthly/all-time stats and simple recent progress chart
  - `pages/SettingsPage.tsx`: Rest time, theme, sound/vibration, import/export, clear data


## Data Models

- `ExerciseSet`: `{ id, reps, weight?, bandResistance?, proximityToFailure, restTime, completedAt }`
- `WorkoutSession`: `{ id, date, exerciseType, variation, sets, totalReps, completed, createdAt, updatedAt }`
- `PersonalRecord`: `{ exerciseType, variation, maxReps, maxWeight, maxBandResistance, date }`
- `AppSettings`: `{ defaultRestTime, soundEnabled, vibrationEnabled, theme }`


## Setup & Configuration

- Requirements: Node 18+ recommended.
- Install: `npm install`
- Development: `npm run dev` then open `http://localhost:3000/`
- Type-check: `npm run check`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview: `npm run preview`
- PWA: Service worker registers via `virtual:pwa-register` (`src/main.tsx`) and config in `vite.config.ts`.
- Aliases: `@` resolves to `src` via Vite/TS config.


## Common Development Workflows

- Add features:
  - Update types in `src/types/index.ts` if needed
  - Add UI in relevant `pages/*` or `components/*`
  - Add/adjust store actions in `src/store/index.ts`
  - Persist via `src/services/storage.ts`
  - Style with Tailwind classes and keep mobile-first ergonomics
- Fix bugs:
  - Start from the page/component using the behavior
  - Check store action and storage serialization/deserialization
  - Validate types match usage
- UI changes:
  - Prefer grid/flex patterns used already
  - Keep chip spacing consistent (`gap-1`), `tabular-nums` for numbers
- Data changes:
  - Ensure storage read/write rehydrates `Date` and handles optional fields


## Testing Methodology

- Current: Manual testing flows + type-checking
  - Quick Session: Home → expand Quick Session → tap reps → toast + history
  - Add set: Workout → open modal → save → rest timer starts
  - Complete session: Workout → Complete → see on Home/History
  - Settings: Toggle theme/sound/vibration, adjust rest time
- Recommended next steps:
  - Add Vitest + Testing Library for component and store tests
  - Snapshot tests for key pages and modal flows


## Known Issues & Clarifications

- Export/Import keys mismatch:
  - `src/services/storage.ts` uses keys like `pullup_sessions` (singular)
  - `src/pages/SettingsPage.tsx` uses `pullups_*` (plural) in export/import
  - Impact: Exported JSON may not reflect live data; imported data may not load
  - Action: Unify keys to the service layer constants
- Personal records shape inconsistency:
  - Store exposes `personalRecords: PersonalRecord[]`
  - `src/pages/ProgressPage.tsx` treats `personalRecords` as an object with `Object.entries(...)`
  - Action: Normalize to array usage or introduce a keyed map from the store
- Theme management duplication:
  - `src/hooks/useTheme.ts` and `SettingsPage` both set `<html>` classes and `localStorage`
  - Action: Centralize theme updates (prefer the hook), let SettingsPage call the hook
- Quick Session scope:
  - Currently logs bodyweight pull-ups only (`exerciseType: 'normal'`, `variation: 'bodyweight'`)
  - Action: Consider expanding to respect selected exercise/variation
- IDs:
  - IDs use `Date.now().toString()`
  - Action: Prefer `crypto.randomUUID()` for collision-resistant IDs
- Storage backend:
  - Product docs mention IndexedDB/Dexie; implementation uses `localStorage`
  - Action: Plan migration to IndexedDB for robustness and larger data


## Key Components & Interactions

- `HomePage`:
  - Quick stats (week/day/best)
  - Quick Session (rep chips 1–13) → creates completed session and shows toast
  - Recent sessions → tap navigates back to `/workout` with `activeSession`
- `WorkoutPage`:
  - Add set modal (`SetModal`) → updates session and rest timer
  - Rest timer with sound/vibration; uses `settings.defaultRestTime`
  - Complete session → clears `activeSession` and navigates home
- `SetModal`:
  - Reps input + chips
  - Variation-aware inputs for weight/band
  - RPE row uses `grid grid-cols-8` for even spacing; `tabular-nums`


## Style & UX Conventions

- Layout: Single column, max width `max-w-md`, centered content
- Dark mode: `darkMode: 'class'` (Tailwind), hook sets `<html>` classes
- Spacing: Button chips use `gap-1` for compact grids; padding `px-3.5 py-1.5`
- Accessibility: Use role/aria for RPE radiogroup; ensure focus handling on modals


## Deployment

- Vercel: Static SPA with `vercel.json` rewrite to `/`
- PWA: Manifest generated by `vite-plugin-pwa`, icons from `public/`
- Build artifacts: `dist/`


## How To Make Changes Safely

- Start from types → store → UI → persistence (bottom → up)
- Keep interfaces simple and deep; don’t leak storage details into UI components
- Favor general-purpose utilities in `services/` and `lib/` for cross-cutting logic
- Add feature flags or small abstractions rather than ad-hoc checks


## Future Improvements

- Migrate persistence to IndexedDB/Dexie with schema-based records
- Add automated tests (Vitest + RTL) and CI lint/type-check gates
- Add charts library for richer progress visualization
- Improve import/export to use the storage service consistently
- Add session notes and tags; filter in History


## Troubleshooting

- Development server: `npm run dev` (port `3000`)
- No data loading after import: Verify storage keys; align with service constants
- Theme not sticking: Ensure `<html>` has `light`/`dark` class; check `localStorage('theme')`


## File Map (Quick Reference)

- Routing: `src/App.tsx`
- Entry: `src/main.tsx`, `index.html`
- State: `src/store/index.ts`
- Persistence: `src/services/storage.ts`
- Types: `src/types/index.ts`
- Styles: `src/index.css`, `tailwind.config.js`
- Pages: `src/pages/*`
- Components: `src/components/*`
