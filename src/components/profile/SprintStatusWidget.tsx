import { CalendarDays, Flame, Target, TrendingUp } from 'lucide-react';
import { formatDate } from '../../lib/format';
import type { SprintSummary } from '../../types/sprint';
import './SprintStatusWidget.css';

interface SprintStatusWidgetProps {
  startedOn: string;
  summary: SprintSummary;
}

export function SprintStatusWidget({ startedOn, summary }: SprintStatusWidgetProps) {
  const stats = [
    { id: 'started', icon: CalendarDays, label: 'Started', value: formatDate(startedOn) },
    { id: 'current', icon: Target, label: 'Current day', value: `Day ${summary.currentDay}` },
    {
      id: 'points',
      icon: TrendingUp,
      label: 'Points',
      value: `${summary.points} / ${summary.maxPoints}`,
    },
    {
      id: 'completion',
      icon: Target,
      label: 'Completion',
      value: `${summary.completedDays} / ${summary.totalDays}`,
    },
    {
      id: 'streak',
      icon: Flame,
      label: 'Streak',
      value: `${summary.streak} ${summary.streak === 1 ? 'day' : 'days'}`,
    },
  ];

  return (
    <ul className="sprint-status">
      {stats.map(({ id, icon: Icon, label, value }) => (
        <li key={id} className="sprint-status__item">
          <span className="sprint-status__icon" aria-hidden="true">
            <Icon size={15} strokeWidth={2.5} />
          </span>
          <span className="sprint-status__label">{label}</span>
          <span className="sprint-status__value">{value}</span>
        </li>
      ))}
    </ul>
  );
}
