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
