import { Flag, Lock, Trophy } from 'lucide-react';
import type { SprintCard as SprintCardModel } from '../../types/sprint';
import './SprintCard.css';

interface LockedCardProps {
  card: SprintCardModel;
  /** Fired on click. Locked cards are never enterable. */
  onSelect: (card: SprintCardModel) => void;
  hint?: string | undefined;
}

function milestoneIcon(card: SprintCardModel) {
  if (card.type === 'starting-test') return Flag;
  if (card.type === 'ending-test') return Trophy;
  return null;
}

/** Any card the student cannot enter yet — days or milestones alike. */
export function LockedCard({ card, onSelect, hint }: LockedCardProps) {
  const Icon = milestoneIcon(card);
  const isMilestone = Icon !== null;

  return (
    <button
      type="button"
      className={`sprint-card sprint-card--locked${
        isMilestone ? ' sprint-card--milestone' : ''
      }`}
      aria-disabled="true"
      aria-label={`${card.title} — locked`}
      onClick={() => onSelect(card)}
    >
      {hint && <span className="sprint-card__hint">{hint}</span>}

      <span className="sprint-card__head">
        <span className="sprint-card__index">
          {Icon ? <Icon size={15} aria-hidden="true" /> : (card.day ?? card.index)}
        </span>
        {isMilestone && (
          <span className="sprint-card__milestone-tag">
            {card.type === 'starting-test' ? 'Start' : 'Finish'}
          </span>
        )}
      </span>

      <span className="sprint-card__title">{card.title}</span>
      {/* Milestones keep their descriptive label; a locked day is described
          by the "Locked" footer alone. */}
      {isMilestone && <span className="sprint-card__subtitle">{card.subtitle}</span>}

      <span className="sprint-card__footer">
        <Lock size={13} aria-hidden="true" />
        Locked
      </span>
    </button>
  );
}
