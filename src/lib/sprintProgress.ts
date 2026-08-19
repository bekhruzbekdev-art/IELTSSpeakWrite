import type {
  DayRecord,
  JourneyCard,
  SprintProgressState,
  SprintSummary,
} from '../types/sprint';

export const SPRINT_DAYS = 30;
export const POINTS_PER_DAY = 10;
export const MAX_SPRINT_POINTS = SPRINT_DAYS * POINTS_PER_DAY;

/** Local-calendar day key, so the throttle follows the student's own midnight. */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

/** Midnight at the start of the day after `date`. */
export function startOfNextDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + 1);
  return next;
}

/** Milliseconds until the student's next local midnight. */
export function msUntilNextMidnight(now: Date = new Date()): number {
  return Math.max(0, startOfNextDay(now).getTime() - now.getTime());
}

function dayStatusFor(record: DayRecord): 'COMPLETED' | 'IN_PROGRESS' | 'CURRENT' {
  if (record.completedAt && record.speakingSubmitted && record.writingSubmitted) {
    return 'COMPLETED';
  }
  return record.speakingSubmitted || record.writingSubmitted ? 'IN_PROGRESS' : 'CURRENT';
}

function tasksFor(record: DayRecord): JourneyCard['tasks'] {
  return [
    { kind: 'speaking', submitted: record.speakingSubmitted },
    { kind: 'writing', submitted: record.writingSubmitted },
  ];
}

/**
 * Derives all 32 cards from stored progress.
 *
 * Unlock rules:
 *  - The Starting Point Test gates the whole journey.
 *  - Day N+1 requires Day N to be COMPLETED (both tasks submitted).
 *  - Throttle: at most one day may open per calendar day, so a day whose
 *    predecessor was completed today stays locked until local midnight.
 *  - Missing a day costs nothing — the active card simply stays where it is.
 *  - A day in `staffUnlockedDays` (an approved unlock request) opens
 *    regardless of sequence or throttle, and stays open.
 *  - The Ending Point Test opens only after Day 30 is completed.
 */
export function buildJourney(
  state: SprintProgressState,
  now: Date = new Date(),
): JourneyCard[] {
  const cards: JourneyCard[] = [];
  const startingCompleted = state.startingTest.completedAt !== null;

  cards.push({
    id: 'starting-test',
    index: 1,
    type: 'starting-test',
    title: 'Starting Point Test',
    subtitle: 'Baseline assessment',
    status: startingCompleted ? 'COMPLETED' : 'CURRENT',
    points: state.startingTest.points,
    maxPoints: 0,
    isActive: !startingCompleted,
    tasks: [],
  });

  let activeClaimed = !startingCompleted;

  for (let day = 1; day <= SPRINT_DAYS; day += 1) {
    const record = state.days[day - 1];
    if (!record) continue;

    const previousCompletedAt =
      day === 1
        ? state.startingTest.completedAt
        : state.days[day - 2]?.completedAt ?? null;

    const hasActivity =
      record.speakingSubmitted || record.writingSubmitted || record.completedAt !== null;

    const derived = dayStatusFor(record);
    const staffUnlocked = state.staffUnlockedDays.includes(day);

    let status: JourneyCard['status'];
    let lockReason: JourneyCard['lockReason'];
    let unlocksAt: string | undefined;
    let unlockedBy: JourneyCard['unlockedBy'];

    if (derived === 'COMPLETED') {
      status = 'COMPLETED';
    } else if (staffUnlocked) {
      // An approved unlock request overrides both gates, permanently.
      status = derived;
      unlockedBy = 'staff-grant';
    } else if (!previousCompletedAt) {
      status = 'LOCKED';
      lockReason = day === 1 ? 'sprint-not-started' : 'previous-incomplete';
    } else if (!hasActivity && isSameCalendarDay(new Date(previousCompletedAt), now)) {
      status = 'LOCKED';
      lockReason = 'daily-throttle';
      unlocksAt = startOfNextDay(new Date(previousCompletedAt)).toISOString();
    } else if (activeClaimed) {
      status = 'LOCKED';
      lockReason = 'previous-incomplete';
    } else {
      status = derived;
      unlockedBy = 'sequence';
    }

    // Only the day reached through the normal sequence is the "active" card;
    // a staff grant opens an extra door without moving the student.
    if (unlockedBy === 'sequence' && (status === 'CURRENT' || status === 'IN_PROGRESS')) {
      activeClaimed = true;
    }

    cards.push({
      id: `day-${day}`,
      index: day + 1,
      type: 'day',
      day,
      title: `Day ${day}`,
      subtitle: 'Speaking + Writing',
      status,
      points: record.points,
      maxPoints: POINTS_PER_DAY,
      isActive:
        unlockedBy === 'sequence' && (status === 'CURRENT' || status === 'IN_PROGRESS'),
      tasks: tasksFor(record),
      ...(lockReason ? { lockReason } : {}),
      ...(unlocksAt ? { unlocksAt } : {}),
      ...(unlockedBy ? { unlockedBy } : {}),
    });
  }

  const lastDayCompleted = state.days[SPRINT_DAYS - 1]?.completedAt ?? null;
  const endingCompleted = state.endingTest.completedAt !== null;

  cards.push({
    id: 'ending-test',
    index: SPRINT_DAYS + 2,
    type: 'ending-test',
    title: 'Ending Point Test',
    subtitle: 'Final assessment',
    status: endingCompleted ? 'COMPLETED' : lastDayCompleted ? 'CURRENT' : 'LOCKED',
    points: state.endingTest.points,
    maxPoints: 0,
    isActive: !endingCompleted && lastDayCompleted !== null,
    tasks: [],
    ...(lastDayCompleted || endingCompleted
      ? {}
      : { lockReason: 'previous-incomplete' as const }),
  });

  return cards;
}

/** Consecutive completed days from Day 1. */
function currentStreak(days: DayRecord[]): number {
  let streak = 0;
  for (const record of days) {
    if (record.completedAt) streak += 1;
    else break;
  }
  return streak;
}

export function summarise(state: SprintProgressState): SprintSummary {
  const completedDays = state.days.filter((d) => d.completedAt !== null).length;
  const points = state.days.reduce((total, d) => total + d.points, 0);

  return {
    currentDay: Math.min(completedDays + 1, SPRINT_DAYS),
    completedDays,
    totalDays: SPRINT_DAYS,
    points,
    maxPoints: MAX_SPRINT_POINTS,
    streak: currentStreak(state.days),
  };
}

export const LOCK_MESSAGES: Record<NonNullable<JourneyCard['lockReason']>, string> = {
  'sprint-not-started': 'Complete the Starting Point Test first.',
  'previous-incomplete': 'Complete the previous stage first.',
  'daily-throttle': 'Your next day opens at midnight.',
};
