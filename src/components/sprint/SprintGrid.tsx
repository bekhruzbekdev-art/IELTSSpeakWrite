import { useEffect, useRef, useState } from 'react';
import {
  LOCKED_CARD_MESSAGE,
  PLACEHOLDER_CONTENT_MESSAGE,
} from '../../data/sprintCards';
import type { SprintCard as SprintCardModel } from '../../types/sprint';
import { LockedCard } from './LockedCard';
import { MilestoneCard } from './MilestoneCard';
import { SprintCard } from './SprintCard';
import './SprintGrid.css';

interface SprintGridProps {
  cards: SprintCardModel[];
}

const HINT_DURATION_MS = 2400;

/**
 * Lays out the 32-card journey and owns the transient click hint.
 * There is no unlock logic here — a card's status comes from static config.
 */
export function SprintGrid({ cards }: SprintGridProps) {
  const [hint, setHint] = useState<{ cardId: string; message: string } | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const showHint = (card: SprintCardModel) => {
    const message =
      card.status === 'locked' ? LOCKED_CARD_MESSAGE : PLACEHOLDER_CONTENT_MESSAGE;

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
              {card.status === 'locked' ? (
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
