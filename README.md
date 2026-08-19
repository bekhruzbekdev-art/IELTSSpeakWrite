# IELTS SpeakWrite Sprint

A 30-day IELTS Speaking + Writing learning platform.

**Current stage: front end over a mock data layer.** There is no backend, no
database and no real authentication. Every score, ranking and band figure comes
from `src/data/demo.ts` and is there so the screens can be reviewed.

## Running the project

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | typecheck, then production build into `dist/` |
| `npm run preview` | serve the production build |

### Preview login

Authentication is a **development-only stub** — no accounts, users or passwords
exist in the codebase. Any non-empty username and password opens the interface.
Only the typed display name is kept (in `sessionStorage`); the password is
discarded. `src/auth/AuthContext.tsx` is replaced wholesale when teacher-
provisioned auth is built.

## Routes

| Route | Page |
| --- | --- |
| `/login` | Development preview login |
| `/sprint` | 32-card journey (default after login) |
| `/leaderboard` | Cohort podium and standings |
| `/profile/learning` | Learning Profile analytics |
| `/profile` | Account and Sprint statistics |
| `/support`, `/settings` | "Coming soon" — sidebar entries disabled with a tooltip |

## Unlock rules

Card status is **always derived** from stored progress by
`buildJourney()` in `src/lib/sprintProgress.ts`, never stored:

- The Starting Point Test gates the journey.
- Day N+1 requires Day N `COMPLETED` — both the Speaking and Writing task submitted.
- **Throttle:** at most one day opens per calendar day. A day whose predecessor
  was completed today stays locked until the student's local midnight.
- Missing a day costs nothing; the active card stays put.
- The Ending Point Test opens only after Day 30 is completed.

Statuses are `LOCKED`, `CURRENT`, `IN_PROGRESS` (one task in) and `COMPLETED`.

## Design system

All colour, spacing, radius, shadow and type values live in
`src/styles/tokens.css`. Dark mode is a token override under
`:root[data-theme='dark']` — **no component hardcodes a colour**.

Two constraints the palette check produced, now encoded in the tokens:

- `#10B981` (2.54:1) and `#F59E0B` (2.15:1) fall below 3:1 on the light
  surface. They are used for **marks with an icon and label only**; status text
  uses `--color-success-text` / `--color-warning-text`, which pass WCAG AA.
- `#6366F1` is 3.97:1 on the dark surface — large text only. Small text uses
  `--color-primary-text` (`#818CF8`, 5.95:1).

Charts use a single categorical hue (`--chart-mark`); magnitude is carried by
mark length, never by colour. Status is never signalled by colour alone.

## AI scores

Every band figure is model-produced and is labelled `Estimated Band Score` with
a standing *AI-generated preview* notice stating that a teacher reviews and may
adjust it. Nothing is presented as an official IELTS result.

## Audio

`src/lib/audio.ts` fixes the capture contract for Speaking tasks — Opus in a
WebM or Ogg container, in that preference order, via `MediaRecorder`. No
recording UI ships yet; the module exists so every future recorder produces the
same shape.

## Structure

```
src/
  auth/          Development-only preview session
  components/
    analytics/   Charts, insights, Day 1 vs Day 30 comparison
    layout/      AppLayout, Sidebar, navigation config
    leaderboard/ Podium, LeaderboardTable
    profile/     AvatarPicker, AvatarGlyph, SprintStatusWidget
    sprint/       SprintGrid, SprintCard, MilestoneCard, LockedCard, CountdownTimer
    ui/          BrandMark, ThemeToggle, StatusBadge, AiScoreBadge, Surface
  data/demo.ts   ALL mock data — replace with API responses
  lib/           Unlock engine, audio contract, formatters
  pages/         One per route
  styles/        Design tokens + global styles
  types/         Domain types
```

## Deploying to Vercel

`vercel.json` carries the Vite preset plus an SPA fallback rewrite, so
client-side routes resolve on direct navigation.

```bash
npx vercel login
npx vercel --prod
```

Or import the repository at [vercel.com/new](https://vercel.com/new) — no CLI or
token needed, and every push redeploys.

## Known data inconsistencies

Carried deliberately from the specification, isolated in `src/data/demo.ts`:

1. Profile reports **76/300 points** while the Leaderboard places "You" at
   **254 points**.
2. The Learning Profile shows a Day 20 / Day 30 error trend for a student whose
   Sprint status is Day 8.
3. Sprint completion timestamps are generated **relative to today** rather than
   pinned to a fixed start date, so the sequential-unlock rule and the midnight
   throttle can be exercised for real. The Profile "Started" date therefore
   moves with the current date.
