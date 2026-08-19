import { useEffect, useRef, useState } from 'react';
import { LOCK_MESSAGES } from '../../lib/sprintProgress';
import type { JourneyCard } from '../../types/sprint';
import { LockedCard } from './LockedCard';
import { MilestoneCard } from './MilestoneCard';
import { SprintCard } from './SprintCard';
import './SprintGrid.css';

interface SprintGridProps {
  cards: JourneyCard[];
}

const HINT_DURATION_MS = 2600;
const OPEN_CARD_MESSAGE = 'Content will be added later.';

export function SprintGrid({ cards }: SprintGridProps) {
  const [hint, setHint] = useState<{ cardId: string; message: string } | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const showHint = (card: JourneyCard) => {
    const message =
      card.status === 'LOCKED'
        ? LOCK_MESSAGES[card.lockReason ?? 'previous-incomplete']
        : OPEN_CARD_MESSAGE;

    setHint({ cardId: card.id, message });

    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setHint(null), HINT_DURATION_MS);
  };

  return (
    <>
      <ul className="sprint-grid">
        {cards.map((card) => {
          const cardHint = hint?.cardId === card.id ? hint.message : undefined;
          const isMilestone = card.type !== 'day';

          return (
            <li key={card.id} className="sprint-grid__cell">
              {card.status === 'LOCKED' ? (
                <LockedCard card={card} onSelect={showHint} hint={cardHint} />
              ) : isMilestone ? (
                <MilestoneCard card={card} onSelect={showHint} hint={cardHint} />
              ) : (
                <SprintCard card={card} onSelect={showHint} hint={cardHint} />
              )}
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className="visually-hidden">
        {hint?.message ?? ''}
      </p>
    </>
  );
}
