import { ArrowRight, Flag, Trophy } from 'lucide-react';
import type { SprintCardProps } from './SprintCard';
import './SprintCard.css';

/**
 * The two journey milestones — Starting Point Test and Ending Point Test —
 * in their open state. The locked variant is rendered by LockedCard.
 */
export function MilestoneCard({ card, onSelect, hint }: SprintCardProps) {
  const isStart = card.type === 'starting-test';
  const Icon = isStart ? Flag : Trophy;

  return (
    <button
      type="button"
      className="sprint-card sprint-card--milestone"
      onClick={() => onSelect(card)}
    >
      {hint && <span className="sprint-card__hint">{hint}</span>}

      <span className="sprint-card__head">
        <span className="sprint-card__index">
          <Icon size={15} aria-hidden="true" />
        </span>
        <span className="sprint-card__milestone-tag">{isStart ? 'Start' : 'Finish'}</span>
      </span>

      <span className="sprint-card__title">{card.title}</span>
      <span className="sprint-card__subtitle">{card.subtitle}</span>

      <span className="sprint-card__footer">
        Open
        <ArrowRight size={14} aria-hidden="true" />
      </span>
    </button>
  );
}
