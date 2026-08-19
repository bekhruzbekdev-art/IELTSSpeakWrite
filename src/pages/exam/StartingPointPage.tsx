import { CheckCircle2, Lock, Mic, PenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SpeakingResults, WritingResults } from '../../components/exam/ResultsPanel';
import { PageHeader, SectionHeading, Surface } from '../../components/ui/Surface';
import { formatBand } from '../../lib/format';
import { useAppData } from '../../state/AppDataContext';
import type { MockStatus } from '../../types/exam';
import './StartingPointPage.css';

const STATUS_LABEL: Record<MockStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress — resume',
  submitted: 'Submitted',
};

export function StartingPointPage() {
  const { startingPoint, learningProfileNote } = useAppData();
  const navigate = useNavigate();

  const { speaking, writing } = startingPoint;
  const bothDone = speaking.status === 'submitted' && writing.status === 'submitted';

  const mocks = [
    {
      id: 'speaking',
      icon: Mic,
      title: 'Speaking Mock',
      duration: '~15 minutes',
      detail: 'Parts 1–3 with an automated examiner. Your microphone starts by itself.',
      status: speaking.status,
      band: speaking.analysis?.overall_band ?? null,
      path: '/sprint/starting-point/speaking',
    },
    {
      id: 'writing',
      icon: PenLine,
      title: 'Writing Mock',
      duration: '60 minutes',
      detail: 'Task 1 and Task 2 on one clock. Auto-submits when time runs out.',
      status: writing.status,
      band: writing.analysis?.overall_band ?? null,
      path: '/sprint/starting-point/writing',
    },
  ];

  return (
    <div className="starting-point">
      <PageHeader
        title="Starting Point Test"
        subtitle="A diagnostic, not a lesson. It sets the baseline your Sprint adapts to."
      />

      {bothDone && (
        <p className="starting-point__locked" role="status">
          <Lock size={15} aria-hidden="true" />
          Both mocks are submitted, so the Starting Point Test is now read-only.
          Your baseline is set.
        </p>
      )}

      <ul className="starting-point__choices">
        {mocks.map((mock) => {
          const done = mock.status === 'submitted';

          return (
            <li key={mock.id}>
              <div className={`starting-point__card${done ? ' starting-point__card--done' : ''}`}>
                <span className="starting-point__icon" aria-hidden="true">
                  <mock.icon size={20} />
                </span>

                <h2 className="starting-point__card-title">{mock.title}</h2>
                <p className="starting-point__duration">{mock.duration}</p>
                <p className="starting-point__detail">{mock.detail}</p>

                <div className="starting-point__card-foot">
                  <span
                    className={`starting-point__status starting-point__status--${mock.status}`}
                  >
                    {done && <CheckCircle2 size={13} aria-hidden="true" />}
                    {STATUS_LABEL[mock.status]}
                    {done && mock.band !== null && ` · band ${formatBand(mock.band)}`}
                  </span>

                  <button
                    type="button"
                    className="button button--primary"
                    disabled={done}
                    onClick={() => navigate(mock.path)}
                  >
                    {mock.status === 'in-progress' ? 'Resume' : `Start ${mock.title}`}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {learningProfileNote && (
        <Surface padding="lg">
          <SectionHeading
            title="Baseline"
            description="Aggregated from whichever mocks you have submitted."
          />
          <div className="starting-point__baseline">
            <div>
              <span className="starting-point__baseline-label">Overall</span>
              <span className="starting-point__baseline-value">
                {learningProfileNote.overallBand !== null
                  ? formatBand(learningProfileNote.overallBand)
                  : '—'}
              </span>
            </div>
            <div>
              <span className="starting-point__baseline-label">Speaking</span>
              <span className="starting-point__baseline-value">
                {learningProfileNote.speakingBand !== null
                  ? formatBand(learningProfileNote.speakingBand)
                  : '—'}
              </span>
            </div>
            <div>
              <span className="starting-point__baseline-label">Writing</span>
              <span className="starting-point__baseline-value">
                {learningProfileNote.writingBand !== null
                  ? formatBand(learningProfileNote.writingBand)
                  : '—'}
              </span>
            </div>
          </div>
        </Surface>
      )}

      {speaking.analysis && (
        <section>
          <h2 className="starting-point__results-heading">Speaking result</h2>
          <SpeakingResults analysis={speaking.analysis} />
        </section>
      )}

      {writing.analysis && (
        <section>
          <h2 className="starting-point__results-heading">Writing result</h2>
          <WritingResults analysis={writing.analysis} />
        </section>
      )}
    </div>
  );
}
