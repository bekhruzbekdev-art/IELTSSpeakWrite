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

## Roles

Four roles, defined in `src/lib/permissions.ts`.

| Role | Responsible for | Lands on |
| --- | --- | --- |
| Founder | Everything: analytics, audit logs, user management | `/admin` |
| Support Teacher | Support chats, unlock request review, cohort progress | `/admin` |
| Teacher | Live lesson attendance, AI score overrides, assigned students | `/admin/attendance` |
| Student | The 30-day Sprint | `/sprint` |

> **The role is not a security boundary.** With no server, it lives in the
> browser and a determined user can change it. `permissions.ts` exists so the
> UI has one place that decides who sees what, and so the future API can mirror
> the same table. Nothing sensitive may rely on it until the API enforces it.

The login form carries a role picker — a development control, and the only way
to preview each surface without a backend.

## Routes

| Route | Page | Requires |
| --- | --- | --- |
| `/login` | Development preview login | — |
| `/sprint` | 32-card journey | `sprint.view` |
| `/leaderboard` | Cohort podium and standings | `leaderboard.view` |
| `/profile/learning` | Learning Profile analytics | `learning-profile.view` |
| `/profile` | Account, Sprint stats, attendance rate | `profile.view` |
| `/settings` | Theme, notifications, mic tester, sessions | `settings.view` |
| `/support` | Student desk **or** staff review queue, by role | `support.ask` / `support.respond` / `unlock-request.review` |
| `/admin` | Admin panel | `cohort.monitor` and friends |
| `/admin/attendance` | Cohort attendance register | `attendance.manage` |

Reaching a route the role lacks redirects to that role's home.

## Support & day unlock requests

Students get two tabs: **Ask a Question** (a message thread to Support) and
**Day Unlock Request** (a modal listing only the days that are actually locked,
with a required reason).

Support Teachers and the Founder see the review queue instead. **Approving is
what opens the day** — it writes to `staffUnlockedDays`, which
`buildJourney()` treats as bypassing both the sequential rule and the midnight
throttle, permanently. A granted day is an extra open door: it does not move
the student's active card, and it is labelled "Opened by staff" on the grid.

The mock store holds one student's progress, so every approval lands on it. A
real implementation applies the unlock to `request.studentId`.

## Attendance

`/admin/attendance` — pick a cohort and date, then mark each student
`Present` / `Late` / `Absent` / `Excused`. History feeds the attendance
percentage shown on the student profile.

Rate = `(present + late) / (present + late + absent)`. Excused absences are
removed from the denominator rather than counted against the student.

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

## State

`src/state/AppDataContext.tsx` is the stand-in for the API: progress, unlock
requests, support threads, attendance and notification preferences. It is
**in-memory only** — a page reload resets it, which is deliberate, so the mock
never drifts into a half-real state. Every mutator maps to one future endpoint.

Because it sits above the router, signing out and back in as another role keeps
the data — which is how the request → approve → unlocked flow can be walked in
one session.

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
