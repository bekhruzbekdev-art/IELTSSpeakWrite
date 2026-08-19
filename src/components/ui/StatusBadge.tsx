import { Check, Clock, Lock, Trophy, Unlock } from 'lucide-react';
import type { SprintCardStatus } from '../../types/sprint';
import './StatusBadge.css';

type Tone = 'success' | 'primary' | 'warning' | 'muted' | 'gold';

const STATUS_TONE: Record<SprintCardStatus, Tone> = {
  COMPLETED: 'success',
  CURRENT: 'primary',
  IN_PROGRESS: 'warning',
  LOCKED: 'muted',
};

const STATUS_LABEL: Record<SprintCardStatus, string> = {
  COMPLETED: 'Completed',
  CURRENT: 'Current',
  IN_PROGRESS: 'In progress',
  LOCKED: 'Locked',
};

const STATUS_ICON = {
  COMPLETED: Check,
  CURRENT: Unlock,
  IN_PROGRESS: Clock,
  LOCKED: Lock,
} as const;

/**
 * Status is never carried by colour alone — every badge ships an icon and a
 * text label, which is also the relief channel the palette check requires for
 * the sub-3:1 success and warning fills.
 */
export function StatusBadge({ status }: { status: SprintCardStatus }) {
  const Icon = STATUS_ICON[status];

  return (
    <span className={`status-badge status-badge--${STATUS_TONE[status]}`}>
      <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function MilestoneBadge({ label, gold = false }: { label: string; gold?: boolean }) {
  return (
    <span className={`status-badge status-badge--${gold ? 'gold' : 'primary'}`}>
      {gold && <Trophy size={12} strokeWidth={2.5} aria-hidden="true" />}
      {label}
    </span>
  );
}
