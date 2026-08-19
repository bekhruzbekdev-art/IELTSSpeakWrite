/** Types for the 32-card Sprint journey. */

export type SprintCardType = 'starting-test' | 'day' | 'ending-test';

export type SprintCardStatus = 'LOCKED' | 'CURRENT' | 'IN_PROGRESS' | 'COMPLETED';

/** Every day carries exactly two tasks. */
export type TaskKind = 'speaking' | 'writing';

/** Why a card is locked — drives the message the student sees. */
export type LockReason = 'previous-incomplete' | 'daily-throttle' | 'sprint-not-started';

export interface DayRecord {
  /** 1–30. */
  day: number;
  speakingSubmitted: boolean;
  writingSubmitted: boolean;
  /** Set once both tasks are in. */
  completedAt: string | null;
  /** 0–10. */
  points: number;
}

export interface MilestoneRecord {
  completedAt: string | null;
  points: number;
}

/** The raw stored progress. Card status is always derived from this. */
export interface SprintProgressState {
  startedOn: string;
  startingTest: MilestoneRecord;
  days: DayRecord[];
  endingTest: MilestoneRecord;
}

/** A card as the UI renders it — fully derived, never stored. */
export interface JourneyCard {
  id: string;
  /** Position in the journey, 1–32. */
  index: number;
  type: SprintCardType;
  title: string;
  subtitle: string;
  status: SprintCardStatus;
  /** Present on day cards only. */
  day?: number;
  points: number;
  maxPoints: number;
  /** True for the single card the student is currently on. */
  isActive: boolean;
  lockReason?: LockReason;
  /** ISO timestamp a throttled card opens at. */
  unlocksAt?: string;
  tasks: { kind: TaskKind; submitted: boolean }[];
}

export interface SprintSummary {
  currentDay: number;
  completedDays: number;
  totalDays: number;
  points: number;
  maxPoints: number;
  streak: number;
}
