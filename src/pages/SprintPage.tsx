import { useMemo } from 'react';
import { SprintGrid } from '../components/sprint/SprintGrid';
import { PageHeader } from '../components/ui/Surface';
import { demoProgress } from '../data/demo';
import { buildJourney, summarise } from '../lib/sprintProgress';
import './SprintPage.css';

export function SprintPage() {
  // Statuses are derived from stored progress on every render, never stored.
  const cards = useMemo(() => buildJourney(demoProgress), []);
  const summary = useMemo(() => summarise(demoProgress), []);

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

      <SprintGrid cards={cards} />
    </div>
  );
}
