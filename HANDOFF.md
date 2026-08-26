# IELTS SpeakWrite Sprint — Technical Handoff

> Every path, count and claim below was read off the working tree, not recalled.
> Where something is a stub or a fake, it says so.

---

## 1. Project Overview

A 30-day IELTS Speaking + Writing preparation platform, built as a **frontend-only
prototype**. Four roles (`founder`, `support-teacher`, `teacher`, `student`) share one
SPA; students work a 30-day sprint, staff review unlock requests and attendance.

Surfaces that exist today:

- **Sprint** — a 32-card journey (Starting Point → Days 1–30 → final milestone) with
  sequential unlock, a midnight throttle, and staff overrides
- **Starting Point Test** — a diagnostic Speaking + Writing mock in a locked exam shell
- **Academic Writing Task 1** — a separate computer-delivered exam surface (newest module)
- **Learning Profile** — band analytics derived from the diagnostic
- **Leaderboard**, **Support / unlock requests**, **Attendance**, **Profile**, **Settings**

### The three things to internalise first

1. **There is no backend.** No server, no database, no external API. Verified by probe:
   no `fetch(`, `axios`, `import.meta.env` or `process.env` anywhere in `src/`.
2. **There is no AI.** "AI scoring" is a hand-written heuristic in `src/lib/analysis.ts`.
   Verified by probe: no `anthropic`, `openai`, `gemini`, `claude` or `gpt-` reference in `src/`.
3. **Auth and RBAC are UI-layer only.** Any username/password signs you in as any role.
   `src/lib/permissions.ts` carries its own header warning: policy, not a security boundary.

---

## 2. Tech Stack & Dependencies

**Runtime (4):** `react` ^18.3.1 · `react-dom` ^18.3.1 · `react-router-dom` ^6.28.0 ·
`lucide-react` ^0.462.0

**Dev (5):** `vite` ^5.4.11 · `typescript` ^5.6.3 · `@vitejs/plugin-react` ^4.3.4 ·
`@types/react` ^18.3.12 · `@types/react-dom` ^18.3.1

```
npm run dev        vite (port 5173, host: true)
npm run build      tsc --noEmit && vite build
npm run preview    vite preview
npm run typecheck  tsc --noEmit
```

TypeScript runs strict with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and
`verbatimModuleSyntax` — indexing an array yields `T | undefined`, so guards that look
redundant usually are not.

**No CSS framework.** Design tokens are CSS custom properties in `src/styles/tokens.css`;
dark mode re-declares them under `:root[data-theme='dark']`. Each component owns a sibling
`.css` file (41 of them). One deliberate exception: `Task1ExamView.css` defines a local
`--cd-*` palette instead of using product tokens, because the exam surface must *not* look
like the app.

**Browser APIs, no polyfills:** `speechSynthesis` (examiner voice), `MediaRecorder` +
`getUserMedia` + `AnalyserNode` (mic), `localStorage` / `sessionStorage`.

**Scale:** 7,956 lines of TS/TSX, 41 CSS files, 15 route entries.

---

## 3. Directory Structure

```
public/
└── tasks/writing/           task-1a.png, task-1b.png, task-1c.png
                             Original figures extracted from the official
                             sample paper. Not redrawn.
src/
├── App.tsx                  All routes; nested guards
├── main.tsx                 createRoot + provider stack
│
├── auth/AuthContext.tsx     Sign-in STUB. sessionStorage 'isws.preview-session'
├── theme/ThemeContext.tsx   Light/dark. localStorage 'isws.theme'
├── state/AppDataContext.tsx In-memory store — progress, requests, threads,
│                             attendance, Starting Point session. Resets on reload.
│
├── routes/
│   ├── RequireAuth.tsx      Redirects to /login
│   └── RequirePermission.tsx  Gate by permission (UI only)
│
├── components/
│   ├── analytics/           BandDumbbell, BarChart, ComparisonPanel,
│   │                        DiagnosticNote, InsightCard, ProgressBanner, charts.css
│   ├── attendance/          AttendanceRoster
│   ├── exam/                ExamShell, ResultsPanel, SpeakingMock, WritingMock
│   ├── layout/              AppLayout, Sidebar, navigation.ts
│   ├── leaderboard/         LeaderboardTable, Podium
│   ├── profile/             AvatarGlyph, AvatarPicker, SprintStatusWidget
│   ├── settings/            MicrophoneTester
│   ├── sprint/              SprintGrid, SprintCard, LockedCard,
│   │                        MilestoneCard, CountdownTimer
│   ├── support/             MessageThread, UnlockRequestModal, UnlockRequestQueue
│   ├── ui/                  AiScoreBadge, BrandMark, StatusBadge, Surface, ThemeToggle
│   └── writing/             Task1ExamView  ← computer-delivered Task 1 UI
│
├── pages/
│   ├── LoginPage, SprintPage, LeaderboardPage, LearningProfilePage,
│   │   ProfilePage, SettingsPage, SupportPage
│   ├── admin/               AdminHomePage, AttendancePage
│   ├── exam/                StartingPointPage, SpeakingMockPage, WritingMockPage
│   └── writing/             WritingTask1Page  ← owns Task 1 module state
│
├── lib/
│   ├── sprintProgress.ts    Unlock engine — pure, derived, never stored
│   ├── permissions.ts       RBAC policy table (+ "not a security boundary" header)
│   ├── analysis.ts          The heuristic scorer + countWords
│   ├── adaptiveSprint.ts    Weakest sub-skills → Day-1 focus tags
│   ├── attendance.ts        Roster + rate maths
│   ├── audio.ts             MediaRecorder format negotiation
│   ├── examinerVoice.ts     speechSynthesis wrapper + guard timeout
│   ├── examinerPrompts.ts   Examiner system prompts (text; nothing consumes them)
│   ├── examStorage.ts       'isws.starting-point.v1'
│   ├── task1Storage.ts      'isws.writing-task-1.v1'
│   └── format.ts            Band/number formatting
│
├── data/
│   ├── demo.ts              All mock cohort data
│   ├── startingPointTest.ts The diagnostic paper
│   └── writingTask1Data.ts  Academic Task 1 bank (1A/1B/1C) + attribution
│
├── types/                   account, analytics, attendance, exam, leaderboard,
│                            rbac, settings, sprint, support, writingTask1
└── styles/                  tokens.css, global.css
```

### Routes

| Path | Guard | Notes |
|---|---|---|
| `/login` | — | Any credentials work |
| `/writing/task-1` | `sprint.view` | **Outside `AppLayout`** — full-viewport exam |
| `/sprint` | `sprint.view` | |
| `/sprint/starting-point` | `sprint.view` | Landing + results |
| `/sprint/starting-point/speaking` | `sprint.view` | Exam mode |
| `/sprint/starting-point/writing` | `sprint.view` | Exam mode |
| `/leaderboard` | `leaderboard.view` | |
| `/profile/learning` | `learning-profile.view` | |
| `/support` | `support.*` / `unlock-request.review` | |
| `/profile`, `/settings` | `profile.view`, `settings.view` | |
| `/admin` | `cohort.monitor` etc. | |
| `/admin/attendance` | `attendance.manage` | |
| `/`, `*` | — | Redirect to the role's home |

---

## 4. Current Implementation Status

### Working

| Area | Notes |
|---|---|
| Sprint unlock engine | Sequential + midnight throttle + staff grant. `SPRINT_DAYS = 30`, bookended by a Starting Point card and a milestone card. Pure, derived per render. |
| Starting Point Test | Speaking (18 Q + cue card) and Writing (Task 1 + 2), locked exam shell, auto-save, 60:00 clock with auto-submit. |
| **Writing Task 1 module** | CD-IELTS layout, 3 authentic questions, zoomable original figures, per-task drafts, display settings — all persisted. |
| Learning Profile | Band dumbbells, comparison panel, diagnostic note, focus tags. |
| Leaderboard / Attendance / Support / Settings / Profile | All functional against mock data. |
| Theming | Light/dark across every surface; status inks contrast-validated. |
| RBAC routing | Four roles, per-permission route gates, role-specific home paths. |

### Stub or fake — do not mistake for real

| Thing | Reality |
|---|---|
| **Authentication** | Any username + any password + a role picker. `sessionStorage`. No accounts exist. |
| **RBAC** | Client-side policy table. Trivially bypassed. Not a security boundary. |
| **Scoring** | Heuristic. See §5 — it measures *length and timing*, not quality. |
| **Cohort data** | `src/data/demo.ts`. In-memory, resets on reload. |
| **Audio** | Captured to measure duration, then discarded. Never stored, never uploaded. |
| **Examiner prompts** | `examinerPrompts.ts` holds text no code consumes — a placeholder for a model that isn't wired up. |

### Not built

30-day curriculum content · adaptive content selection · any persistence beyond two
localStorage keys · audio storage · notifications · export/reporting · **any test suite**

### Content gaps

- **Writing Task 2** — one prompt in the diagnostic; no bank.
- **Task 1 bank is 3 questions** (1A bar chart, 1B line graph, 1C process diagram).
  `Task1Category` also declares `pie_chart`, `table` and `map` — no content for those yet.
- Speaking/Writing skill-taxonomy work from earlier sessions lives in scratch files, **not in this repo**.

---

## 5. Data Flow & Logic

### Provider stack

```
ThemeProvider → AuthProvider → AppDataProvider → BrowserRouter → App
```

`AppDataContext` sits above the router so exam state survives navigation.

### Unlock engine — `lib/sprintProgress.ts`

Card status is **always derived, never stored**:

```
COMPLETED                                   → COMPLETED
staff grant                                 → derived, unlockedBy: 'staff-grant'
no previous completion                      → LOCKED  (sequential)
previous completed today, no activity yet   → LOCKED  (daily-throttle),
                                              unlocksAt = next midnight
otherwise                                   → UNLOCKED
```

### Persistence — exactly two keys

| Key | Storage | Written by |
|---|---|---|
| `isws.starting-point.v1` | localStorage | `lib/examStorage.ts` |
| `isws.writing-task-1.v1` | localStorage | `lib/task1Storage.ts` |
| `isws.preview-session` | **session**Storage | `auth/AuthContext.tsx` |
| `isws.theme` | localStorage | `theme/ThemeContext.tsx` |

Both exam stores share one contract: debounced writes (400 ms), defensive reads that merge
over a known-good default, an `immediate` flag for submit, and a `flush()` bound to
`pagehide` / `beforeunload`.

> **Load-bearing invariant.** The localStorage write happens *outside* the `setState`
> updater. A React updater must be pure and React may decline to run one — submitting
> navigates away in the same handler, and a save that rode inside the updater was silently
> dropped with the unmounting component. `WritingTask1Page.update()` computes the next
> state from a ref, persists, then calls `setState`. Do not "simplify" it back.
>
> The same rule bit the clocks: reporting time upward from inside a `setRemaining` updater
> fired twice a second under StrictMode. Both clocks now tick in one effect and report in
> another.

### The scorer — `lib/analysis.ts`

**Speaking.** Targets 25 s / 105 s / 40 s for Parts 1–3.

```
fluency = toHalfBand(4.5 + avg(ratios) * 2.2 * min(1, coverage + 0.15))
lexical_resource = grammatical_range = pronunciation = fluency   ← literal copies
confidence = 0.25   (0.15 if nothing was recorded)
```

**Writing.**

```
lengthRatio      = min(1.25, words / minWords)
task_achievement = 3.5 + lengthRatio * 2.8
lexical_resource = 4.5 + lengthRatio * 1.2
coherence        = 4 + min(1.6, paragraphs * 0.5) + (avgSentence > 8 ? 0.6 : 0)
grammar          = 6 - min(2, errors * 0.4)
overall          = (avg(task1) + avg(task2) * 2) / 3
confidence       = 0.35
```

"Errors" are **five literal regexes**: lowercase `i`, `there is` + plural, `people is`,
double space, contractions.

**Measured behaviour:** the word "banana" repeated to 264 words scores **6.5**; a genuine
113-word essay scores **6.0**. 30 s of real speech and 30 s of "aaa" both score **6.0**.
This is a placeholder with a UI disclaimer (`components/ui/AiScoreBadge`), not a marker.

### Writing Task 1 module

```
WritingTask1Page                    owns state, persists every change
  └─ Task1ExamView                  pure presentation
       ├─ status bar                20:00 guide clock (red under 5:00),
       │                            candidate identity, text size, high contrast
       ├─ 50/50 split               prompt + zoomable figure | plain textarea
       └─ footer                    per-task tabs with word counts, submit
```

The clock is **advisory** — Task 1 is not separately timed in the real test, so zero turns
the clock red and stops rather than seizing the paper.

Figures render at natural size at 100% and are never upscaled past their own resolution
(they are low-resolution scans; blowing them up only softens the axis labels). Zoom steps
1× / 1.5× / 2× / 3× scroll inside a capped box, and reset when the question changes.

`startingPointTest.ts` Task 1 is the *same* question (1A). It references the bank by
`stimulusQuestionId` and composes its prompt from the bank, so wording and figure cannot
drift apart. The old synthetic `TaskChart` — a redrawn chart with approximated values — has
been deleted.

---

## 6. Key Challenges & Known Issues

### Blocking anything real

1. **No backend.** Auth, RBAC, progress, submissions and audio all need a server before
   this can touch a real student.
2. **The scorer is not a scorer.** It rewards length. Replacing it is the single highest-value
   change, and `types/exam.ts` already models the full criterion contract to fill.
3. **No tests at all.** No unit tests, no e2e, no CI. Every change is verified by hand.

### Traps for the next person

| Trap | Why |
|---|---|
| Persisting inside a `setState` updater | Silently dropped on unmount. See §5. |
| Calling a parent's setter inside an updater | Double-fires under StrictMode. |
| Reading state inside an updater to act on it | Bit `approveUnlockRequest` before; read *before* updating. |
| Adding a `--color-*` outside `tokens.css` | Breaks dark mode. |
| Assuming `arr[i]` is defined | `noUncheckedIndexedAccess` is on. |
| Styling `Task1ExamView` with product tokens | Intentionally a different visual language. |
| Treating brand fills as text colours | `#10B981` is 2.54:1 on white. Use `--color-*-text`. |

### Environment

- Outbound HTTPS goes through an allowlisting proxy; most external domains return 403.
  Vercel deploys and third-party content fetches fail here for that reason, not a code fault.
- `vercel.json` is configured (Vite preset + SPA rewrite) but no deploy has succeeded.
- Chromium is available for Playwright at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
  Playwright is **not** a project dependency.

### Attribution

`public/tasks/writing/*.png` and the Task 1 prompts come from the official *IELTS Academic
Writing Sample Tasks* (2023), pages 3–5, recorded in the `source` field of every record in
`writingTask1Data.ts`. Redistribution terms have not been reviewed — treat as an open
question before any public deploy.

---

## 7. Where to Start

**Highest value, in order**

1. Replace the heuristic scorer with a real assessment path.
2. Stand up a backend: real auth, server-enforced RBAC, durable progress.
3. Add a test suite — the unlock engine and the two storage modules are pure and are the
   natural first targets.

**Self-contained and useful now**

4. Extend the Task 1 bank to `pie_chart`, `table`, `map`.
5. Build a Task 2 bank to match Task 1's shape.
6. Persist and play back speaking audio.
7. Wire `examinerPrompts.ts` to something, or delete it.

**Questions only the project owner can answer**

- Is this a commercial product, a teaching tool, or a prototype?
- What is the licensing position on official IELTS material?
- Should recorded audio be retained, and under what consent?

---

**Branch:** `claude/ielts-speakwrite-sprint-shell-tmh5c7` · **Verified against the working
tree**, not from memory.
