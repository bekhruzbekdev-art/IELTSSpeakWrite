import { Flag, Trophy } from 'lucide-react';
import type { JourneyCard } from '../../types/sprint';
import { StatusBadge } from '../ui/StatusBadge';
import './SprintCard.css';

interface LockedCardProps {
  card: JourneyCard;
  onSelect: (card: JourneyCard) => void;
  hint?: string | undefined;
}

function milestoneIcon(card: JourneyCard) {
  if (card.type === 'starting-test') return Flag;
  if (card.type === 'ending-test') return Trophy;
  return null;
}

/** Any card the student cannot enter yet. Never navigable. */
export function LockedCard({ card, onSelect, hint }: LockedCardProps) {
  const Icon = milestoneIcon(card);
  const isMilestone = Icon !== null;

  return (
    <button
      type="button"
      className={`sprint-card sprint-card--locked${
        isMilestone ? ` sprint-card--milestone sprint-card--${
          card.type === 'starting-test' ? 'start' : 'finish'
        }` : ''
      }`}
      aria-disabled="true"
      aria-label={`${card.title} — locked`}
      onClick={() => onSelect(card)}
    >
      {hint && <span className="sprint-card__hint">{hint}</span>}

      <span className="sprint-card__head">
        <span className="sprint-card__index">
          {Icon ? <Icon size={15} aria-hidden="true" /> : card.day}
        </span>
      </span>

      <span className="sprint-card__title">{card.title}</span>
      {isMilestone && (
        <span className="sprint-card__subtitle">
          {card.type === 'ending-test' ? 'Opens after Day 30' : card.subtitle}
        </span>
      )}

      <span className="sprint-card__footer">
        <StatusBadge status="LOCKED" />
      </span>
    </button>
  );
}
