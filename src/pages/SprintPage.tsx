import { SprintGrid } from '../components/sprint/SprintGrid';
import { sprintCards } from '../data/sprintCards';
import './SprintPage.css';

export function SprintPage() {
  return (
    <div className="sprint-page">
      <header className="sprint-page__header">
        <div>
          <h1 className="sprint-page__title">IELTS SpeakWrite Sprint</h1>
          <p className="sprint-page__subtitle">
            30 Days of Speaking + Writing Practice
          </p>
        </div>

        <ol className="sprint-page__journey" aria-label="Journey overview">
          <li className="sprint-page__journey-step">Start</li>
          <li className="sprint-page__journey-step">30 Days</li>
          <li className="sprint-page__journey-step">End</li>
        </ol>
      </header>

      <p className="sprint-page__notice">Content will be added later.</p>

      <SprintGrid cards={sprintCards} />
    </div>
  );
}
