import { useMemo } from 'react';
import { SprintGrid } from '../components/sprint/SprintGrid';
import { PageHeader } from '../components/ui/Surface';
import { buildJourney, summarise } from '../lib/sprintProgress';
import { useAppData } from '../state/AppDataContext';
import './SprintPage.css';

export function SprintPage() {
  const { progress } = useAppData();

  // Statuses are derived from stored progress on every render, never stored.
  const cards = useMemo(() => buildJourney(progress), [progress]);
  const summary = useMemo(() => summarise(progress), [progress]);
  const granted = cards.filter((card) => card.unlockedBy === 'staff-grant');

  return (
    <div className="sprint-page">
      <PageHeader
        title="IELTS SpeakWrite Sprint"
        subtitle="30 Days of Speaking + Writing Practice"
        action={
          <dl className="sprint-page__stats">
            <div>
              <dt>Day</dt>
              <dd>
                {summary.currentDay}
                <span> / {summary.totalDays}</span>
              </dd>
            </div>
            <div>
              <dt>Points</dt>
              <dd>
                {summary.points}
                <span> / {summary.maxPoints}</span>
              </dd>
            </div>
            <div>
              <dt>Streak</dt>
              <dd>{summary.streak}</dd>
            </div>
          </dl>
        }
      />

      <p className="sprint-page__notice">
        Each day holds a Speaking and a Writing task. A day counts as complete
        once both are submitted, and the next day opens at midnight. Task content
        will be added later.
      </p>

      {granted.length > 0 && (
        <p className="sprint-page__granted" role="status">
          A Support Teacher opened{' '}
          {granted.map((card) => card.title).join(', ')} for you. These stay open
          and do not follow the usual order.
        </p>
      )}

      <SprintGrid cards={cards} />
    </div>
  );
}
