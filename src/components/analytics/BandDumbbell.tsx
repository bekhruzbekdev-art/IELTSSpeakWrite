import { formatBand, formatDelta } from '../../lib/format';
import type { CriterionScore } from '../../types/analytics';
import './charts.css';

interface BandDumbbellProps {
  title: string;
  criteria: CriterionScore[];
  maxBand: number;
  /**
   * Lower bound of the plotted range. These are position marks, not lengths,
   * so a non-zero floor is legitimate — and starting at 0 squeezes every band
   * into the right-hand third where the movement becomes unreadable.
   */
  minBand?: number;
}

/**
 * Start-to-current band movement per criterion.
 *
 * One hue carries "current"; "start" is a hollow marker of the same hue, so
 * the two readings are separated by shape as well as fill — identity is never
 * colour-alone. Every row is directly labelled, which is also the relief
 * channel for the mark contrast check.
 */
export function BandDumbbell({
  title,
  criteria,
  maxBand,
  minBand = 4,
}: BandDumbbellProps) {
  const span = maxBand - minBand;
  const pct = (band: number) =>
    Math.min(100, Math.max(0, ((band - minBand) / span) * 100));

  return (
    <figure className="chart">
      <figcaption className="chart__title">{title}</figcaption>

      <ul className="chart__legend">
        <li className="chart__legend-item">
          <span className="chart__dot chart__dot--start" aria-hidden="true" />
          Starting point
        </li>
        <li className="chart__legend-item">
          <span className="chart__dot chart__dot--current" aria-hidden="true" />
          Current estimate
        </li>
      </ul>

      <ul className="dumbbell">
        {criteria.map((criterion) => {
          const delta = criterion.current - criterion.start;
          const left = Math.min(pct(criterion.start), pct(criterion.current));
          const width = Math.abs(pct(criterion.current) - pct(criterion.start));

          return (
            <li
              key={criterion.id}
              className="dumbbell__row"
              data-tooltip={`${criterion.label}: ${formatBand(
                criterion.start,
              )} → ${formatBand(criterion.current)} (${formatDelta(delta)})`}
            >
              <span className="dumbbell__label">{criterion.label}</span>

              <span className="dumbbell__track">
                <span
                  className="dumbbell__connector"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
                <span
                  className="chart__dot chart__dot--start dumbbell__marker"
                  style={{ left: `${pct(criterion.start)}%` }}
                />
                <span
                  className="chart__dot chart__dot--current dumbbell__marker"
                  style={{ left: `${pct(criterion.current)}%` }}
                />
              </span>

              <span className="dumbbell__values">
                <span className="dumbbell__from">{formatBand(criterion.start)}</span>
                <span className="dumbbell__arrow" aria-hidden="true">
                  →
                </span>
                <span className="dumbbell__to">{formatBand(criterion.current)}</span>
                <span
                  className={`dumbbell__delta${
                    delta > 0 ? ' dumbbell__delta--up' : ''
                  }`}
                >
                  {formatDelta(delta)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="chart__scale">
        Band scale {minBand}–{maxBand}
      </p>
    </figure>
  );
}
