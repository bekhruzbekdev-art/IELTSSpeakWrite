/**
 * Types for the Sprint journey.
 *
 * This is a UI-only shape for the current stage. The real persistence
 * schema is intentionally not designed yet.
 */

/** A card is either one of the two milestone tests or one of the 30 days. */
export type SprintCardType = 'starting-test' | 'day' | 'ending-test';

/**
 * Visual state only — there is no unlock business logic at this stage.
 * `available` is the single card a student could enter, `complete` exists
 * for the visual system and is not used by the current static config.
 */
export type SprintCardStatus = 'available' | 'locked' | 'complete';

export interface SprintCard {
  /** Stable identifier, e.g. `starting-test`, `day-7`, `ending-test`. */
  id: string;
  /** Position in the journey, 1–32. */
  index: number;
  type: SprintCardType;
  /** Card heading, e.g. `Starting Point Test` or `Day 1`. */
  title: string;
  /** Short supporting label, e.g. `Baseline assessment`. */
  subtitle: string;
  /** 1–30 for day cards; absent on the two milestone tests. */
  day?: number;
  status: SprintCardStatus;
}
