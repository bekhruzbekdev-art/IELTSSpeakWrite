/*
 * ============================================================================
 * DEMO DATA — replace wholesale with API responses.
 * ============================================================================
 *
 * Every figure below comes from the product specification and exists so the
 * screens can be reviewed. Nothing here is a real student, score or ranking.
 *
 * Two known inconsistencies in the specified figures, kept as specified:
 *   1. The Profile widget reports 76/300 points while the Leaderboard places
 *      "You" at 254 points. Both values are rendered as written.
 *   2. The Learning Profile shows a Day 20 / Day 30 error trend for a student
 *      whose Sprint status is Day 8.
 *
 * The completion timestamps ARE generated relative to the current date rather
 * than pinned, so the sequential-unlock rule and the midnight throttle can be
 * exercised for real instead of being faked.
 */

import type { Account } from '../types/account';
import type { AttendanceMark, CohortStudent } from '../types/attendance';
import type { ActiveSession } from '../types/settings';
import type { SupportMessage, SupportThread, UnlockRequest } from '../types/support';
import type { LearningProfile } from '../types/analytics';
import type { Cohort } from '../types/leaderboard';
import type { DayRecord, SprintProgressState } from '../types/sprint';
import { POINTS_PER_DAY, SPRINT_DAYS } from '../lib/sprintProgress';

/** Days finished before today. */
const COMPLETED_DAYS = 7;
/** Points already banked on the in-progress day (Speaking submitted). */
const IN_PROGRESS_POINTS = 6;

function daysAgo(count: number): Date {
  const date = new Date();
  date.setHours(20, 0, 0, 0);
  date.setDate(date.getDate() - count);
  return date;
}

function buildDays(): DayRecord[] {
  return Array.from({ length: SPRINT_DAYS }, (_, index) => {
    const day = index + 1;

    if (day <= COMPLETED_DAYS) {
      return {
        day,
        speakingSubmitted: true,
        writingSubmitted: true,
        completedAt: daysAgo(COMPLETED_DAYS - day + 1).toISOString(),
        points: POINTS_PER_DAY,
      };
    }

    // The active day: Speaking is in, Writing is not.
    if (day === COMPLETED_DAYS + 1) {
      return {
        day,
        speakingSubmitted: true,
        writingSubmitted: false,
        completedAt: null,
        points: IN_PROGRESS_POINTS,
      };
    }

    return {
      day,
      speakingSubmitted: false,
      writingSubmitted: false,
      completedAt: null,
      points: 0,
    };
  });
}

export const demoProgress: SprintProgressState = {
  startedOn: daysAgo(COMPLETED_DAYS).toISOString(),
  startingTest: { completedAt: daysAgo(COMPLETED_DAYS + 1).toISOString(), points: 0 },
  days: buildDays(),
  endingTest: { completedAt: null, points: 0 },
  staffUnlockedDays: [],
};

export const demoAccount: Account = {
  username: 'student_0417',
  displayName: 'You',
  cohortName: 'Cohort B — August Sprint',
  avatar: 'unspecified',
  startedOn: demoProgress.startedOn,
};

export const demoCohort: Cohort = {
  id: 'cohort-b',
  name: 'Cohort B — August Sprint',
  memberCount: 24,
  entries: [
    { id: 'p1', rank: 1, displayName: 'A. R.', points: 287, completedDays: 29, isCurrentUser: false },
    { id: 'p2', rank: 2, displayName: 'M. T.', points: 281, completedDays: 29, isCurrentUser: false },
    { id: 'p3', rank: 3, displayName: 'S. K.', points: 276, completedDays: 28, isCurrentUser: false },
    { id: 'p4', rank: 4, displayName: 'D. N.', points: 271, completedDays: 28, isCurrentUser: false },
    { id: 'p5', rank: 5, displayName: 'L. B.', points: 266, completedDays: 27, isCurrentUser: false },
    { id: 'p6', rank: 6, displayName: 'J. H.', points: 259, completedDays: 27, isCurrentUser: false },
    { id: 'p7', rank: 7, displayName: 'You', points: 254, completedDays: 26, isCurrentUser: true },
    { id: 'p8', rank: 8, displayName: 'R. V.', points: 249, completedDays: 26, isCurrentUser: false },
    { id: 'p9', rank: 9, displayName: 'E. P.', points: 243, completedDays: 25, isCurrentUser: false },
    { id: 'p10', rank: 10, displayName: 'T. G.', points: 238, completedDays: 25, isCurrentUser: false },
    { id: 'p11', rank: 11, displayName: 'K. M.', points: 231, completedDays: 24, isCurrentUser: false },
    { id: 'p12', rank: 12, displayName: 'O. S.', points: 224, completedDays: 24, isCurrentUser: false },
  ],
};

export const demoLearningProfile: LearningProfile = {
  startingBand: 5.5,
  currentBand: 6.5,
  maxBand: 9,

  writing: [
    { id: 'task-response', label: 'Task Response', start: 5.0, current: 6.5 },
    { id: 'coherence', label: 'Coherence & Cohesion', start: 5.5, current: 6.5 },
    { id: 'lexical', label: 'Lexical Resource', start: 6.0, current: 6.5 },
    { id: 'grammar', label: 'Grammatical Range', start: 5.5, current: 6.5 },
  ],

  speaking: [
    { id: 'fluency', label: 'Fluency & Coherence', start: 5.5, current: 6.5 },
    { id: 'vocabulary', label: 'Lexical Resource', start: 5.0, current: 5.5 },
    { id: 'grammar', label: 'Grammatical Range', start: 5.5, current: 6.5 },
    { id: 'pronunciation', label: 'Pronunciation', start: 6.0, current: 7.5 },
  ],

  speakingParts: [
    { id: 'part-1', label: 'Part 1', band: 7.0 },
    { id: 'part-2', label: 'Part 2', band: 6.0 },
    { id: 'part-3', label: 'Part 3', band: 6.5 },
  ],

  errorTrend: [
    { label: 'Day 1', day: 1, errors: 18 },
    { label: 'Day 10', day: 10, errors: 13 },
    { label: 'Day 20', day: 20, errors: 8 },
    { label: 'Day 30', day: 30, errors: 6 },
  ],

  insights: [
    {
      id: 'strongest',
      kind: 'Strongest improvement',
      headline: 'Pronunciation, +1.5 bands',
      detail: 'Speaking pronunciation moved from 6.0 to 7.5 — the largest single gain across both skills.',
      tone: 'positive',
    },
    {
      id: 'weakness',
      kind: 'Persistent weakness',
      headline: 'Speaking lexical resource, +0.5 bands',
      detail: 'Vocabulary range in Speaking has moved least. It remains the lowest-scoring criterion at 5.5.',
      tone: 'attention',
    },
    {
      id: 'frequent-error',
      kind: 'Most frequent error',
      headline: 'Article usage (a / an / the)',
      detail: 'Articles account for the largest share of flagged grammar errors across written submissions.',
      tone: 'attention',
    },
    {
      id: 'best-section',
      kind: 'Best speaking section',
      headline: 'Part 1 — band 7.0',
      detail: 'Short familiar exchanges are the strongest section. Part 2 is the weakest at band 6.0.',
      tone: 'positive',
    },
  ],

  comparison: {
    first: {
      day: 1,
      label: 'Day 1',
      estimatedBand: 5.5,
      wordCount: 214,
      grammarErrors: 18,
      speakingDurationSeconds: 96,
    },
    latest: {
      day: 30,
      label: 'Day 30',
      estimatedBand: 6.5,
      wordCount: 268,
      grammarErrors: 6,
      speakingDurationSeconds: 132,
    },
  },
};


/* ---------------------------------------------------------------------------
 * Cohort roster — used by attendance and the admin queues.
 * ------------------------------------------------------------------------ */

export const demoCohortStudents: CohortStudent[] = [
  { id: 'student-0417', displayName: 'B. M.', cohortId: 'cohort-b' },
  { id: 'student-0102', displayName: 'A. R.', cohortId: 'cohort-b' },
  { id: 'student-0118', displayName: 'M. T.', cohortId: 'cohort-b' },
  { id: 'student-0124', displayName: 'S. K.', cohortId: 'cohort-b' },
  { id: 'student-0131', displayName: 'D. N.', cohortId: 'cohort-b' },
  { id: 'student-0145', displayName: 'L. B.', cohortId: 'cohort-b' },
  { id: 'student-0152', displayName: 'J. H.', cohortId: 'cohort-b' },
  { id: 'student-0166', displayName: 'R. V.', cohortId: 'cohort-b' },
  { id: 'student-0203', displayName: 'E. P.', cohortId: 'cohort-a' },
  { id: 'student-0211', displayName: 'T. G.', cohortId: 'cohort-a' },
  { id: 'student-0219', displayName: 'K. M.', cohortId: 'cohort-a' },
  { id: 'student-0227', displayName: 'O. S.', cohortId: 'cohort-a' },
];

export const demoCohorts = [
  { id: 'cohort-b', name: 'Cohort B — August Sprint' },
  { id: 'cohort-a', name: 'Cohort A — July Sprint' },
];

/** `YYYY-MM-DD` in local time. */
export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/*
 * An 11-long pattern sampled with a stride, so different students land on
 * genuinely different attendance rates. A short cycle read in fixed-width
 * windows gives every student the same tally, which makes the percentage
 * look broken.
 */
const ATTENDANCE_PATTERN: AttendanceMark['status'][] = [
  'present',
  'present',
  'late',
  'present',
  'absent',
  'present',
  'present',
  'excused',
  'present',
  'absent',
  'late',
];

/** Six lesson days of history so the percentages on profiles are non-trivial. */
function buildAttendance(): AttendanceMark[] {
  const marks: AttendanceMark[] = [];

  for (let back = 6; back >= 1; back -= 1) {
    const date = isoDate(daysAgo(back));

    demoCohortStudents.forEach((student, index) => {
      const status =
        ATTENDANCE_PATTERN[(index * 3 + back) % ATTENDANCE_PATTERN.length];
      if (!status) return;
      marks.push({ studentId: student.id, cohortId: student.cohortId, date, status });
    });
  }

  return marks;
}

export const demoAttendance: AttendanceMark[] = buildAttendance();

/* ---------------------------------------------------------------------------
 * Support desk
 * ------------------------------------------------------------------------ */

export const demoUnlockRequests: UnlockRequest[] = [
  {
    id: 'req-1001',
    studentId: 'student-0118',
    studentName: 'M. T.',
    cohortId: 'cohort-b',
    day: 9,
    reason: 'I was in hospital for two days and could not submit my tasks.',
    status: 'pending',
    createdAt: daysAgo(1).toISOString(),
  },
  {
    id: 'req-1002',
    studentId: 'student-0145',
    studentName: 'L. B.',
    cohortId: 'cohort-b',
    day: 12,
    reason: 'Travelling for a family event this week, would like to catch up early.',
    status: 'pending',
    createdAt: daysAgo(2).toISOString(),
  },
  {
    id: 'req-1003',
    studentId: 'student-0124',
    studentName: 'S. K.',
    cohortId: 'cohort-b',
    day: 6,
    reason: 'Internet outage on my submission day.',
    status: 'approved',
    createdAt: daysAgo(5).toISOString(),
    decidedAt: daysAgo(4).toISOString(),
    decidedBy: 'Support Teacher',
  },
];

export const demoSupportThreads: SupportThread[] = [
  {
    id: 'thread-you',
    studentId: 'student-0417',
    studentName: 'B. M.',
    cohortId: 'cohort-b',
    subject: 'Question about my Sprint',
    lastActivityAt: daysAgo(1).toISOString(),
    resolved: false,
  },
  {
    id: 'thread-0131',
    studentId: 'student-0131',
    studentName: 'D. N.',
    cohortId: 'cohort-b',
    subject: 'Cannot open the recorder on my phone',
    lastActivityAt: daysAgo(1).toISOString(),
    resolved: false,
  },
  {
    id: 'thread-0152',
    studentId: 'student-0152',
    studentName: 'J. H.',
    cohortId: 'cohort-b',
    subject: 'Lesson time change',
    lastActivityAt: daysAgo(3).toISOString(),
    resolved: true,
  },
];

export const demoSupportMessages: SupportMessage[] = [
  {
    id: 'msg-1',
    threadId: 'thread-you',
    author: 'student',
    authorName: 'B. M.',
    body: 'Hello, when does my next day become available?',
    sentAt: daysAgo(1).toISOString(),
  },
  {
    id: 'msg-2',
    threadId: 'thread-you',
    author: 'staff',
    authorName: 'Support Teacher',
    body: 'Your next day opens at midnight once both of today\'s tasks are submitted.',
    sentAt: daysAgo(1).toISOString(),
  },
  {
    id: 'msg-3',
    threadId: 'thread-0131',
    author: 'student',
    authorName: 'D. N.',
    body: 'The microphone button does nothing on my phone browser.',
    sentAt: daysAgo(1).toISOString(),
  },
  {
    id: 'msg-4',
    threadId: 'thread-0152',
    author: 'student',
    authorName: 'J. H.',
    body: 'Is the Thursday lesson moving to 18:00?',
    sentAt: daysAgo(3).toISOString(),
  },
  {
    id: 'msg-5',
    threadId: 'thread-0152',
    author: 'staff',
    authorName: 'Support Teacher',
    body: 'Yes — Thursday lessons now start at 18:00 for the rest of the Sprint.',
    sentAt: daysAgo(3).toISOString(),
  },
];

/* ---------------------------------------------------------------------------
 * Settings
 * ------------------------------------------------------------------------ */

export const demoSessions: ActiveSession[] = [
  {
    id: 'session-current',
    device: 'Chrome on Windows',
    location: 'Tashkent, UZ',
    lastSeenAt: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: 'session-phone',
    device: 'Safari on iPhone',
    location: 'Tashkent, UZ',
    lastSeenAt: daysAgo(1).toISOString(),
    isCurrent: false,
  },
];
