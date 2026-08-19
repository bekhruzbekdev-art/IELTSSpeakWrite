import { Mic, PenLine } from 'lucide-react';
import type { JourneyCard } from '../../types/sprint';
import { StatusBadge } from '../ui/StatusBadge';
import { CountdownTimer } from './CountdownTimer';
import './SprintCard.css';

export interface SprintCardProps {
  card: JourneyCard;
  onSelect: (card: JourneyCard) => void;
  hint?: string | undefined;
}

const TASK_ICON = { speaking: Mic, writing: PenLine } as const;
const TASK_LABEL = { speaking: 'Speaking', writing: 'Writing' } as const;

/** A day card in any enterable state — CURRENT, IN_PROGRESS or COMPLETED. */
export function SprintCard({ card, onSelect, hint }: SprintCardProps) {
  const isCompleted = card.status === 'COMPLETED';

  return (
    <button
      type="button"
      className={`sprint-card sprint-card--${card.status.toLowerCase()}`}
      onClick={() => onSelect(card)}
    >
      {hint && <span className="sprint-card__hint">{hint}</span>}

      <span className="sprint-card__head">
        <span className="sprint-card__index">{card.day}</span>
        <span className="sprint-card__tasks">
          {card.tasks.map(({ kind, submitted }) => {
            const Icon = TASK_ICON[kind];
            return (
              <span
                key={kind}
                className={`sprint-card__task${
                  submitted ? ' sprint-card__task--done' : ''
                }`}
                title={`${TASK_LABEL[kind]} — ${submitted ? 'submitted' : 'not submitted'}`}
              >
                <Icon size={12} aria-hidden="true" />
              </span>
            );
          })}
        </span>
      </span>

      <span className="sprint-card__title">{card.title}</span>

      <span className="sprint-card__meta">
        {isCompleted ? (
          <span className="sprint-card__points">
            {card.points} / {card.maxPoints} pts
          </span>
        ) : (
          <span className="sprint-card__countdown">
            <CountdownTimer />
          </span>
        )}
      </span>

      <span className="sprint-card__footer">
        <StatusBadge status={card.status} />
      </span>
    </button>
  );
}
