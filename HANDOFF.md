# IELTS SpeakWrite Sprint — Technical Handoff

## 1. Project Overview

**IELTS SpeakWrite Sprint** is a 30-day adaptive IELTS Speaking + Writing preparation platform with a frontend-only architecture. The application provides:

- **Shell & Layout**: Responsive sidebar navigation, theme toggle (light/dark), role-based sidebar labels (student/staff/admin)
- **Sprint Dashboard**: 30 sequential cards (Days 1–30), each with locked/unlocked status, showing content categories, completion %, and unlock rules
- **Learning Profile**: Analytics dashboard showing band progress (Speaking: 0–9 scale, Writing: 0–9 scale) across five sub-skills per task; adaptive focus recommendations based on weakest sub-skills
- **Admin Controls**: Staff unlock overrides, student unlock-request approval workflow, attendance tracking (11-day rolling window), Settings panel for theme & name
- **Starting Point Test**: Exam-mode speaking/writing mock with 18 speaking questions (plus cue card), 2 writing tasks, heuristic auto-scoring, and localStorage persistence

**Critical limitation:** This is a **frontend-only proof-of-concept**. There is **no backend, no database, and no external APIs**. All data is mock or in-memory; authentication is a UI stub. RBAC is a client-side policy, not a security boundary. This is not production-ready and should not be deployed with real user data.

---

## 2. Tech Stack & Dependencies

### Runtime (4 dependencies)
- **react** `^18.3.1` — UI framework
- **react-dom** `^18.3.1` — DOM renderer
- **react-router-dom** `^6.28.0` — nested routing with guards
- **lucide-react** `^0.462.0` — icon library (24px SVG icons)

### Build & Dev (5 dependencies)
- **vite** `^5.4.11` — bundler (TypeScript 5.6 via Vite preset)
- **typescript** `^5.6.3` — strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`
- **@vitejs/plugin-react** — JSX support
- **@types/react**, **@types/react-dom** — type definitions

### Scripts
```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # tsc --noEmit && vite build
npm run preview      # Preview built app
npm run typecheck    # Type check only
```

### Browser APIs (no polyfills)
- **Web Speech API** (`speechSynthesis`) — examiner voice playback
- **MediaRecorder + getUserMedia** — microphone recording during Speaking exam
- **AnalyserNode** — audio frequency visualization
- **localStorage** — persistent exam progress (key: `isws.starting-point.v1`)

### Environment
- **Vite** + **React 18** with Fast Refresh
- **vercel.json** configured for SPA fallback rewrite
- Strict TypeScript; zero untyped deps
- **No external APIs, no environment variables, no .env file in source**

---

## 3. Directory Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx           # Main router guard (exam-mode lock)
│   │   ├── Sidebar.tsx              # Navigation + role labels + theme toggle
│   │   └── Navigation.tsx
│   ├── sprint/
│   │   ├── SprintCard.tsx           # 30 day cards (status badge, unlock pill)
│   │   ├── SprintDashboard.tsx      # 6×5 grid, "No data yet" fallback
│   │   ├── JourneyStatus.tsx        # Unlock reason pill
│   │   └── Podium.tsx               # Leaderboard ranking (top 3)
│   ├── learning-profile/
│   │   ├── LearningProfile.tsx      # Analytics dashboard
│   │   ├── BandDisplay.tsx          # 0–9 scale with pillars and dumbbell
│   │   └── SkillChart.tsx           # Sub-skill breakdown
│   ├── starting-point/
│   │   ├── StartingPointTest.tsx    # Exam frame + route lock
│   │   ├── SpeakingTest.tsx         # 18 questions, cue card, recorder
│   │   ├── WritingTest.tsx          # Tasks 1 & 2, word counter
│   │   └── ScoreDisplay.tsx         # Results + disclaimer (confidence: 0.25–0.35)
│   ├── admin/
│   │   ├── AttendanceTable.tsx      # 11-day rolling attendance
│   │   ├── UnlockRequestList.tsx    # Pending approval workflow
│   │   └── StaffSettings.tsx        # Theme + name override
│   ├── profile/
│   │   ├── ProfilePage.tsx          # Avatar picker + bio
│   │   └── AvatarPicker.tsx         # 4-option SVG inline
│   └── common/
│       ├── ThemeToggle.tsx
│       └── ErrorBoundary.tsx
├── lib/
│   ├── sprintProgress.ts            # Unlock engine (sequential + midnight throttle)
│   ├── permissions.ts               # RBAC policy table (UI-only)
│   ├── analysis.ts                  # Heuristic scorer (length/timing-based)
│   ├── examStorage.ts               # debounced + sync localStorage write
│   ├── examinerVoice.ts             # speechSynthesis API wrapper
│   ├── audio.ts                     # Format detection, recorder setup
│   ├── adaptiveSprint.ts            # Focus-tag calculation from weakest sub-skills
│   └── pdf.ts                       # PDF text extraction (Flate decompression)
├── state/
│   ├── AppDataContext.tsx           # In-memory store (users, progress, requests)
│   ├── AuthContext.tsx              # Auth stub (dev-only, no credentials)
│   ├── ThemeContext.tsx             # Light/dark toggle + CSS var injection
│   └── types.ts                     # Entity types
├── data/
│   ├── startingPointTest.ts         # 18 speaking Q + cue card + 2 writing tasks
│   ├── demo.ts                      # 10 mock students, 1 staff, 1 admin
│   ├── master_speaking_db.json      # 257 topics / 1,519 items (from PDF)
│   ├── unified_skill_framework.json # 12 IELTS skills + unit mapping
│   └── [other JSON stores]
├── routes/
│   └── index.tsx                    # 14 routes, nested with <Outlet />
├── styles/
│   ├── tokens.css                   # Design tokens (brand, status, text-safe inks)
│   ├── globals.css                  # Reset, root vars
│   ├── [component].css              # Per-component styles (no framework)
│   └── layout.css                   # Grid + flexbox rules
├── App.tsx                          # Route root + context providers
└── main.tsx                         # React 18 createRoot
```

### Key Files by Role

| File | Purpose | Status |
|------|---------|--------|
| `lib/sprintProgress.ts` | Unlock logic (sequential, daily throttle, staff override) | ✅ Complete |
| `lib/analysis.ts` | Heuristic scorer (5 bands/sub-skill) | ✅ Complete (length-based, not ML) |
| `lib/permissions.ts` | RBAC policy (header: "CLIENT-SIDE ONLY") | ✅ Complete (UI stub) |
| `data/startingPointTest.ts` | 18 speaking Q + writing tasks | ✅ Complete |
| `components/sprint/SprintCard.tsx` | Unlock pill + status badge | ✅ Complete |
| `state/AppDataContext.tsx` | In-memory user/progress store | ✅ Complete (resets on reload) |
| `lib/examStorage.ts` | localStorage persistence | ✅ Complete (exam progress only) |
| `components/starting-point/WritingTest.tsx` | Writing exam UI | ⚠️ No Task 1 data (0 records) |
| `lib/adaptiveSprint.ts` | Adaptive focus tags | ✅ Complete (weakest 2–3 sub-skills) |

---

## 4. Current Implementation Status

### ✅ Fully Implemented

1. **Sprint Dashboard**
   - 30 cards (Days 1–30) with sequential unlock logic
   - Locked/unlocked/completed states + unlock reason pills
   - Completion percentage per card
   - Responsive grid (6 columns → 3 → 1 on mobile)

2. **Unlock Engine** (`lib/sprintProgress.ts`)
   - Sequential prerequisites (Day 2 requires Day 1 completion)
   - Midnight throttle: one day per calendar day
   - Staff override: `staffUnlocked` flag bypasses sequence
   - Unlock-request workflow: student requests, staff approves

3. **Learning Profile Analytics**
   - Band display (0–9 scale with pillars + dumbbell marker)
   - Per-task breakdown (Speaking 1–3, Writing 1–2)
   - Per-sub-skill progress (5 sub-skills per task)
   - Adaptive focus tags (weakest 2–3 skills highlighted)

4. **Leaderboard**
   - Top 3 students + their overall band
   - Podium rendering (1st/2nd/3rd positions)
   - Ranking badge on sidebar

5. **Starting Point Test**
   - Exam-mode route lock (`/sprint/starting-point/{speaking,writing}`)
   - 18 speaking questions with cue card
   - 2 writing tasks (Task 1 chart image, Task 2 prompt)
   - MediaRecorder + Web Speech API support
   - Auto-save to localStorage with debounce + sync flush

6. **Heuristic Scoring** (`lib/analysis.ts`)
   - **Speaking**: time-based (targets 25s/105s/40s for parts 1–3) + coverage ratio → fluency band; copies to lexical/grammar/pronunciation
   - **Writing**: length-based (min 150 words Task 1, 250 Task 2) + simple error detection (5 regex patterns) → sub-skill bands
   - **Overall**: weighted average (Task 2 ×2)
   - **Confidence**: 0.25 (speaking), 0.35 (writing) — hardcoded, not learned

7. **Theme System**
   - Light/dark toggle
   - CSS custom properties (`:root[data-theme='dark']` override)
   - Brand palette + status inks validated for WCAG 3:1 contrast

8. **RBAC UI**
   - Role-based sidebar labels (student/staff/admin view different content)
   - Permissions table in `lib/permissions.ts` (header: "CLIENT-SIDE POLICY ONLY")
   - Staff unlock-request approval flow (email summary on `console`)

9. **Admin Pages**
   - Attendance tracking (11-day rolling window, 0–100% per student)
   - Unlock-request queue + approval workflow
   - Settings (theme, name override for staff)

10. **Responsive Design**
    - Mobile-first layout (sidebar collapses, cards stack)
    - CSS Grid + Flexbox (no framework)
    - Touch-friendly interactive elements

### ⚠️ Partial / Stub Implementation

| Feature | Status | Notes |
|---------|--------|-------|
| **Auth** | Stub | Dev-only; no real login, no credentials stored; mock user selector |
| **Database** | None | All data in-memory + mock; resets on reload |
| **External APIs** | None | No backend, no cloud sync, no real IELTS grading |
| **Audio Storage** | Not implemented | Recorded audio is buffered in-memory but never saved/transmitted |
| **Writing Task 1** | 0 records | Content database exists (`data/master_writing_db.json`) but zero Task 1 items yet |
| **Speaking S11/S12** | Weak supply | 0 unit groups in default curriculum; 22 tagging gaps in master DB |
| **PRONUNCIATION** | 0 units | Skill exists in framework but no content assigned |
| **PARAPHRASING** | 0 units | Skill exists in framework but no content assigned |

### ❌ Not Implemented

- Real IELTS question content (stub data only)
- ML-based scoring
- Adaptive curriculum (skill dependencies, prerequisites)
- Audio upload/transmission
- User authentication (no backend)
- Database persistence
- Notifications / email
- Analytics / telemetry
- Export / reporting

---

## 5. Data Flow & Logic

### A. Authentication & State (Stub)

```
main.tsx
  └─ App.tsx
      ├─ <AuthContext>           # Dev stub; user={ id, email, role }
      ├─ <ThemeContext>          # Light/dark + CSS var injection
      └─ <AppDataContext>        # In-memory store:
          ├─ users[] (10 mock)
          ├─ progress[] (Day status, completion %, bands)
          ├─ unlockRequests[] (pending approvals)
          └─ setters (approveUnlockRequest, updateProgress, etc.)
```

No real authentication flow. User selection via dev UI. Roles: `'student'`, `'staff'`, `'admin'`.

### B. Sprint Unlock Logic

```
buildJourney() (sprintProgress.ts)
  ├─ For each day 2–30:
  │   ├─ Read: previous day's completedAt, staffUnlocked flag
  │   ├─ Compute: isSameCalendarDay(completedAt, now)
  │   ├─ Apply rules in order:
  │   │   1. If COMPLETED → status = COMPLETED
  │   │   2. Else if staffUnlocked → status = derived, unlockedBy = 'staff-grant'
  │   │   3. Else if !previousCompletedAt → status = LOCKED, reason = 'not-started'
  │   │   4. Else if !hasActivity && isSameCalendarDay → status = LOCKED, reason = 'daily-throttle'
  │   │   5. Else → status = UNLOCKED
  │   └─ Return: { status, unlockReason, unlocksAt, unlockedBy }
  └─ NO DB WRITES — derived state only
```

Midnight throttle: completed Day 5 at 3 PM today → Day 6 locked until tomorrow 12:00 AM.

### C. Exam Progress Persistence

```
Starting Point Test Flow
  ├─ componentDidMount → load from localStorage (key: isws.starting-point.v1)
  ├─ User answers/records → update in-memory state
  ├─ debounce(saveStartingPointState, 500ms) on every change
  └─ On submit:
      ├─ saveStartingPointState(state, { immediate: true }) ← sync write
      └─ pagehide/beforeunload listener → flushStartingPointState()
```

**Only exam data persists; user/progress/unlockRequests reset on reload.**

### D. Heuristic Scoring Pipeline

**Speaking** (part-wise timing):
```
SPEAKING_TARGETS = { part1: 25s, part2: 105s, part3: 40s }

For each part:
  ratio = actual_duration / target
  fluencyBand = toHalfBand(4.5 + avg(ratios) * 2.2 * min(1, topicCoverage + 0.15))
  
  // Literal copies (not computed):
  lexical_resource = fluencyBand
  grammatical_range = fluencyBand
  pronunciation = fluencyBand

overall = avg(band1, band2, band3)
confidence = 0.25  // Very low; length-based, not ML
```

**Writing** (length + error count):
```
Task 1 & 2:
  lengthRatio = min(1.25, word_count / min_words)
  task_achievement = 3.5 + lengthRatio * 2.8
  lexical_resource = 4.5 + lengthRatio * 1.2
  coherence = 4 + min(1.6, para_count * 0.5) + (avg_sent_len > 8 ? 0.6 : 0)
  grammar = 6 - min(2, error_count * 0.4)
  
  band1_avg = avg(task_achievement, lexical_resource, coherence, grammar)

overall = (band_task1 + band_task2 * 2) / 3
confidence = 0.35  // Still low; heuristic
```

Error detection (5 regex patterns):
- Lowercase `i`
- `there is` + plural noun
- `people is`
- Double space
- Contractions (e.g., `don't`)

**Adaptive Focus** (`adaptiveSprint.ts`):
```
focusesFor(note)
  ├─ Extract sub-skill bands (5 per task type)
  ├─ Find 2–3 weakest (lowest band)
  └─ Return focus tags (e.g., ['S5_FLUENCY', 'S7_PRONUNCIATION'])
```

---

## 6. Key Challenges & Known Issues

### Architecture & Design

| Issue | Impact | Status | Notes |
|-------|--------|--------|-------|
| **Frontend-only, no backend** | Cannot persist real user data or grade accurately | Intentional design | Mentioned in README/UI disclaimers |
| **Auth is a dev stub** | No real login, no credentials, no security | Intentional | `AuthContext` has hardcoded users |
| **RBAC is client-side only** | UI can be bypassed; permissions not enforced server-side | Critical limitation | Header in `lib/permissions.ts` warns: "CLIENT-SIDE POLICY ONLY" |
| **In-memory state resets on reload** | All progress lost except exam data | Intentional | Only `isws.starting-point.v1` persists |
| **No adaptive curriculum** | 30-day plan is static (uses focus tags, not actual unit selection) | Deferred | `adaptiveSprint.ts` suggests focus but doesn't assign content |

### Data Gaps

| Skill | Items | Gap | Impact |
|-------|-------|-----|--------|
| **Writing Task 1** | 0 | No content collected yet | Writing exam shows placeholder "No Task 1 data" |
| **Speaking S11** (Problem Solving) | 0 units in curriculum | 7 untagged Q in master DB | Students see day but no content |
| **Speaking S12** (Prioritisation) | 0 units in curriculum | 15 untagged Q in master DB | Students see day but no content |
| **PRONUNCIATION** | 0 units | Skill in framework but no content | Never shown on Learning Profile |
| **PARAPHRASING** | 0 units | Skill in framework but no content | Never shown on Learning Profile |

### Scoring & Analysis

| Issue | Cause | Impact | Known? |
|-------|-------|--------|--------|
| **Scoring is length-based, not comprehension-based** | 5 regex patterns for grammar; no parsing | 264 repetitions of "banana" = 6.5 band | ✅ Confirmed via test |
| **Speaking lexical/grammar/pronunciation are literal copies of fluency band** | Not computed separately | Bands appear identical | ✅ By design (heuristic stub) |
| **Confidence hardcoded to 0.25 (speaking), 0.35 (writing)** | No ML, no calibration | Disclaimer shows on results | ✅ Intentional |
| **Jaccard similarity fails on boilerplate text** | No TF-IDF weighting | Duplicate detection false-positives | ✅ Documented in `master_speaking_db.json` comments |

### Environment & Deployment

| Issue | Root Cause | Workaround | Status |
|-------|-----------|-----------|--------|
| **Egress proxy blocks external domains** | Network policy in remote environment | Cannot fetch from writing9.com / vercel.com during session | ✅ Not a code bug |
| **No `pdftoppm` (PDF → image)** | Not pre-installed in container | Extracted text via Flate stream decompression + CMap offset derivation | ✅ Implemented |
| **Vercel deploy requires authentication** | API credentials not available in public session | Deploy step is manual; `vercel.json` configured correctly | ✅ Expected |

### Testing & Validation

| Gap | Recommendation | Priority |
|-----|-----------------|----------|
| **No e2e test suite** | Add Playwright tests for unlock flow, exam submission, localStorage persistence | High |
| **No unit tests for `analysis.ts`** | Add test cases for edge cases (0-length text, min/max word counts) | Medium |
| **No accessibility audit** | Run axe-core or manual WCAG 2.1 Level AA scan | Medium |
| **No performance benchmark** | Measure bundle size, LCP, CLS (currently unoptimized) | Low |

### Content Curation

| Task | Status | Notes |
|------|--------|-------|
| **Collect 50 Writing Task 1 tasks** | Blocked | User instructed not to attempt writing9.com again (403 proxy blocks); requires manual collection or alternate source |
| **Retag S11/S12 questions** | Open | 22 untagged questions in master DB; would improve curriculum coverage |
| **Add PRONUNCIATION content** | Open | Requires sourcing or generating phonetics examples |
| **Formalize Part 2 heading structure** | ✅ Complete | 69 headings (not cue cards) documented; structure locked |

---

## 7. Recommendations for Next Steps

### High Priority (Blocking)

1. **Backend & Persistence** — Replace mock data with real database (SQL/NoSQL). Implement server-side auth & RBAC. Add API routes for progress, unlock approvals, attendance.
2. **Real IELTS Content** — Replace stub questions with authentic IELTS materials (speaking Q, writing tasks, cue cards). Add images/audio where needed.
3. **ML Scoring** — Replace heuristic `analysis.ts` with trained model or expert rubric. Calibrate confidence intervals.
4. **Writing Task 1 Collection** — Complete the master database with 48+ authentic chart descriptions (requires legal source or manual creation).

### Medium Priority (Unblocking Features)

5. **Adaptive Curriculum** — Implement `adaptiveSprint.ts` fully: map focus tags → content units, enforce prerequisites, suggest review paths.
6. **Audio Capture & Transmission** — Persist recorded speaking audio (secure upload, storage, playback for student review).
7. **S11/S12 Tagging** — Run retag pass on 22 untagged questions; validate coverage against skill matrix.
8. **Learner Profile Analytics** — Replace mock band data with real progress tracking; add charts over time.

### Low Priority (Polish)

9. **Test Suite** — Add Playwright e2e tests + Jest unit tests for core logic.
10. **Performance** — Optimize bundle size (code-split routes), measure LCP/CLS, consider caching.
11. **Accessibility** — Audit against WCAG 2.1 Level AA; fix any contrast or keyboard-nav issues.
12. **Documentation** — API docs, deployment guide, contributing guidelines.

---

## 8. Key Contacts / Questions for the Original Author

If you're taking over this codebase, ask the original author:

1. **What is the vision for real IELTS content?** (Is this for a commercial platform, educational experiment, or internal tool?)
2. **Who is the target student?** (UK/US-based? International? Band 5–7 or 7–9?)
3. **What is the revenue/deployment model?** (SaaS, self-hosted, embedded?)
4. **Writing Task 1: any legal source approved?** (writing9.com was blocked; are there alternatives?)
5. **Audio: should it be stored for review/analytics?** (Currently captured but discarded.)
6. **Adaptive algorithm: any preferences?** (Spaced repetition? Mastery-based? Skill trees?)

---

## 9. Code Quality Notes

### Strengths
- **Strict TypeScript** with `noUncheckedIndexedAccess` catches many bugs at compile time.
- **Derived-state architecture** avoids stale data; `buildJourney()` is pure.
- **Debounced localStorage** prevents thrashing; sync flush on exit is solid.
- **No external APIs in `src/`** keeps code predictable and testable.
- **CSS custom properties** enable theme switching without duplication.

### Weaknesses
- **Heuristic scoring is brittle** — 5 regex patterns won't catch real grammar errors. Consider Helm or GPT-based rubric as upgrade path.
- **In-memory state is not normalized** — duplication in `users[]` and `progress[]`; consider a single entity graph.
- **No error boundaries on critical routes** — if exam state corrupts, user sees white screen.
- **Attendance calculation uses a 11-day stride** — works but is not obviously correct; add a comment explaining the rolling window.
- **`/admin` pages have no audit log** — staff overrides are logged to `console` only; production would need database+timestamps.

---

**Document generated:** 2026-08-26  
**Branch:** `claude/ielts-speakwrite-sprint-shell-tmh5c7`  
**Status:** Ready for handoff
