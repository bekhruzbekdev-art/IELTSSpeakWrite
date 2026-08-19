import { FileText, Mic } from 'lucide-react';
import { formatBand, formatClock } from '../../lib/format';
import type { SubmissionSnapshot } from '../../types/analytics';
import { AiScoreBadge } from '../ui/AiScoreBadge';
import './ComparisonPanel.css';

interface ComparisonPanelProps {
  first: SubmissionSnapshot;
  latest: SubmissionSnapshot;
}

function SnapshotColumn({
  snapshot,
  variant,
}: {
  snapshot: SubmissionSnapshot;
  variant: 'first' | 'latest';
}) {
  return (
    <article className={`comparison__column comparison__column--${variant}`}>
      <header className="comparison__column-head">
        <h3 className="comparison__day">{snapshot.label}</h3>
        <AiScoreBadge band={snapshot.estimatedBand} />
      </header>

      <dl className="comparison__metrics">
        <div>
          <dt>Words written</dt>
          <dd>{snapshot.wordCount}</dd>
        </div>
        <div>
          <dt>Grammar errors</dt>
          <dd>{snapshot.grammarErrors}</dd>
        </div>
        <div>
          <dt>Speaking length</dt>
          <dd>{formatClock(snapshot.speakingDurationSeconds)}</dd>
        </div>
      </dl>

      <div className="comparison__artefacts">
        <p className="comparison__artefact">
          <FileText size={14} aria-hidden="true" />
          Writing submission — content will be added later.
        </p>
        <p className="comparison__artefact">
          <Mic size={14} aria-hidden="true" />
          Speaking recording — content will be added later.
        </p>
      </div>
    </article>
  );
}

/** Side-by-side first vs. latest submission. */
export function ComparisonPanel({ first, latest }: ComparisonPanelProps) {
  const bandDelta = latest.estimatedBand - first.estimatedBand;
  const errorDelta = first.grammarErrors - latest.grammarErrors;

  return (
    <div className="comparison">
      <div className="comparison__columns">
        <SnapshotColumn snapshot={first} variant="first" />
        <SnapshotColumn snapshot={latest} variant="latest" />
      </div>

      <p className="comparison__summary">
        Estimated band moved <strong>{formatBand(first.estimatedBand)}</strong> →{' '}
        <strong>{formatBand(latest.estimatedBand)}</strong> ({bandDelta > 0 ? '+' : ''}
        {bandDelta.toFixed(1)}), and flagged grammar errors fell by{' '}
        <strong>{errorDelta}</strong> across the same pair of submissions.
      </p>
    </div>
  );
}
