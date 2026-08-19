import { TrendingUp } from 'lucide-react';
import { formatBand, formatDelta } from '../../lib/format';
import './ProgressBanner.css';

interface ProgressBannerProps {
  startingBand: number;
  currentBand: number;
  maxBand: number;
}

/** Hero figure — a single headline number, so no chart. */
export function ProgressBanner({
  startingBand,
  currentBand,
  maxBand,
}: ProgressBannerProps) {
  const delta = currentBand - startingBand;

  return (
    <section className="progress-banner">
      <div className="progress-banner__figures">
        <div className="progress-banner__figure">
          <span className="progress-banner__caption">Starting point</span>
          <span className="progress-banner__value progress-banner__value--muted">
            {formatBand(startingBand)}
          </span>
        </div>

        <span className="progress-banner__arrow" aria-hidden="true">
          →
        </span>

        <div className="progress-banner__figure">
          <span className="progress-banner__caption">Current</span>
          <span className="progress-banner__value">{formatBand(currentBand)}</span>
        </div>

        <span className="progress-banner__delta">
          <TrendingUp size={14} strokeWidth={2.5} aria-hidden="true" />
          {formatDelta(delta)} bands
        </span>
      </div>

      <div
        className="progress-banner__meter"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={maxBand}
        aria-valuenow={currentBand}
        aria-label="Current estimated band"
      >
        <span
          className="progress-banner__meter-start"
          style={{ width: `${(startingBand / maxBand) * 100}%` }}
        />
        <span
          className="progress-banner__meter-fill"
          style={{ width: `${(currentBand / maxBand) * 100}%` }}
        />
      </div>
      <p className="progress-banner__scale">Band scale 0–{maxBand}</p>
    </section>
  );
}
