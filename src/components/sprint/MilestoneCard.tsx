import { Flag, Trophy } from 'lucide-react';
import { MilestoneBadge, StatusBadge } from '../ui/StatusBadge';
import type { SprintCardProps } from './SprintCard';
import './SprintCard.css';

/** Starting and Ending Point Tests in an enterable or completed state. */
export function MilestoneCard({ card, onSelect, hint }: SprintCardProps) {
  const isStart = card.type === 'starting-test';
  const Icon = isStart ? Flag : Trophy;
  const isCompleted = card.status === 'COMPLETED';

  return (
    <button
      type="button"
      className={`sprint-card sprint-card--milestone sprint-card--${
        isStart ? 'start' : 'finish'
      } sprint-card--${card.status.toLowerCase()}`}
      onClick={() => onSelect(card)}
    >
      {hint && <span className="sprint-card__hint">{hint}</span>}

      <span className="sprint-card__head">
        <span className="sprint-card__index">
          <Icon size={15} aria-hidden="true" />
        </span>
      </span>

      <span className="sprint-card__title">{card.title}</span>
      <span className="sprint-card__subtitle">{card.subtitle}</span>

      <span className="sprint-card__footer">
        {isCompleted ? (
          <StatusBadge status="COMPLETED" />
        ) : (
          <MilestoneBadge label={isStart ? 'Start' : 'Final test'} gold={!isStart} />
        )}
      </span>
    </button>
  );
}
