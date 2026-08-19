import type { SprintCard } from '../types/sprint';

/**
 * Static configuration for the 32-card journey:
 *   1        Starting Point Test
 *   2 – 31   Day 1 … Day 30
 *   32       Ending Point Test
 *
 * These cards are visual placeholders. No IELTS material lives here and
 * none should be added until the curriculum stage.
 */

const TOTAL_DAYS = 30;

/** The one day that is visually open in this preview build. */
const AVAILABLE_DAY = 1;

const startingTest: SprintCard = {
  id: 'starting-test',
  index: 1,
  type: 'starting-test',
  title: 'Starting Point Test',
  subtitle: 'Baseline assessment',
  status: 'available',
};

const dayCards: SprintCard[] = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const day = i + 1;
  const isAvailable = day === AVAILABLE_DAY;

  return {
    id: `day-${day}`,
    index: day + 1,
    day,
    type: 'day',
    title: `Day ${day}`,
    subtitle: isAvailable ? 'Daily Sprint' : 'Locked',
    status: isAvailable ? 'available' : 'locked',
  };
});

const endingTest: SprintCard = {
  id: 'ending-test',
  index: TOTAL_DAYS + 2,
  type: 'ending-test',
  title: 'Ending Point Test',
  subtitle: 'Final assessment',
  status: 'locked',
};

export const sprintCards: SprintCard[] = [startingTest, ...dayCards, endingTest];

/** Shown when a student clicks a card that is not open to them. */
export const LOCKED_CARD_MESSAGE = 'Complete the previous stage first.';

/** Placeholder used anywhere a card would eventually show real material. */
export const PLACEHOLDER_CONTENT_MESSAGE = 'Content will be added later.';
