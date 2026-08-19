import { ArrowRight } from 'lucide-react';
import type { SprintCard as SprintCardModel } from '../../types/sprint';
import './SprintCard.css';

export interface SprintCardProps {
  card: SprintCardModel;
  /** Fired on click; the page decides what (if anything) happens. */
  onSelect: (card: SprintCardModel) => void;
  /** Transient message shown above the card, e.g. after a click. */
  hint?: string | undefined;
}

/** A regular day card in its open state. */
export function SprintCard({ card, onSelect, hint }: SprintCardProps) {
  return (
    <button
      type="button"
      className="sprint-card sprint-card--available"
      onClick={() => onSelect(card)}
    >
      {hint && <span className="sprint-card__hint">{hint}</span>}

      <span className="sprint-card__head">
        <span className="sprint-card__index">{card.day ?? card.index}</span>
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
