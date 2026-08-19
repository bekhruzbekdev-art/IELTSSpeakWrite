# IELTS SpeakWrite Sprint

A 30-day IELTS Speaking + Writing learning platform.

**Current stage: application shell and UI foundation only.**
There is no IELTS material, no scoring, no database and no real authentication
in this build. Every card in the Sprint journey is a visual placeholder.

## Running the project

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

## Preview login

The app opens on `/login`. Authentication is a **development-only stub**: no
accounts, users or passwords exist anywhere in the codebase. Any non-empty
username and password opens the interface so the UI can be reviewed. Only the
typed display name is kept (in `sessionStorage`); the password is discarded.

This module (`src/auth/AuthContext.tsx`) will be replaced wholesale when real
authentication is built.

## Routes

| Route | State |
| --- | --- |
| `/login` | Development preview login |
| `/sprint` | The 32-card journey — the only implemented page |
| `/leaderboard`, `/learning-profile`, `/support`, `/profile`, `/settings` | "Coming soon" placeholders |

The five placeholder sections appear in the sidebar as **disabled** items
marked *Soon*. Their routes are registered, so they can be reached by URL
during development.

## Theming

All colour, spacing, radius, shadow and type values live in
`src/styles/tokens.css` and are consumed as CSS custom properties. Dark mode is
a token override under `:root[data-theme='dark']` — **no component hardcodes a
colour**. The theme is set by `src/theme/ThemeContext.tsx`, defaults to the
system preference, persists to `localStorage`, and is toggled from the top bar.

## Structure

```
src/
  auth/          Development-only preview session
  components/
    layout/      AppLayout, Sidebar, navigation config
    sprint/      SprintGrid, SprintCard, MilestoneCard, LockedCard
    ui/          BrandMark, ThemeToggle
  data/          Static 32-card configuration
  pages/         LoginPage, SprintPage, ComingSoonPage
  routes/        RequireAuth
  styles/        Design tokens + global styles
  theme/         Theme provider
  types/         Sprint card types
```

## The 32-card journey

| Position | Card | State in this build |
| --- | --- | --- |
| 1 | Starting Point Test | Milestone, available |
| 2 | Day 1 | Available |
| 3–31 | Day 2 … Day 30 | Locked |
| 32 | Ending Point Test | Milestone, locked |

Card state comes from static configuration in `src/data/sprintCards.ts`. There
is **no unlock logic** — clicking a locked card only shows the message
"Complete the previous stage first."

Layout is 8 × 4 on desktop and steps down to 6, 4, 3 and 2 columns as the
viewport narrows. Below 900px the sidebar becomes a drawer.
