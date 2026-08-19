import type { ChartStimulus } from '../../types/exam';
import './TaskChart.css';

/**
 * The Task 1 stimulus, drawn as SVG rather than shipped as an image so it
 * stays legible in both themes and at any width.
 *
 * Two series distinguished by fill AND a legend; the exam original uses black
 * and grey, so the tones here are neutral by design rather than brand hues.
 * Bars start at zero — length is the encoding.
 */
export function TaskChart({ chart }: { chart: ChartStimulus }) {
  const width = 720;
  const height = 380;
  const padding = { top: 34, right: 16, bottom: 70, left: 78 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const ticks = [0, 200, 400, 600, 800, 1000, 1200];
  const y = (value: number) => padding.top + plotHeight - (value / chart.max) * plotHeight;

  // Two gender groups, each with three periods, each with two bars.
  const groupWidth = plotWidth / chart.groups.length;
  const clusterWidth = groupWidth / (chart.periods.length + 0.4);
  const barWidth = clusterWidth / 2.6;

  return (
    <figure className="task-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="task-chart__svg"
        role="img"
        aria-label={chart.title}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(tick)}
              y2={y(tick)}
              className="task-chart__grid"
            />
            <text x={padding.left - 10} y={y(tick) + 4} className="task-chart__tick">
              {tick}
            </text>
          </g>
        ))}

        <text
          transform={`translate(18 ${padding.top + plotHeight / 2}) rotate(-90)`}
          className="task-chart__axis-label"
        >
          {chart.yAxisLabel} ({chart.unitNote})
        </text>

        {chart.groups.map((group, groupIndex) => {
          const groupX = padding.left + groupIndex * groupWidth;

          return (
            <g key={group.id}>
              <text
                x={groupX + groupWidth / 2}
                y={padding.top - 6}
                className="task-chart__group-label"
              >
                {group.label}
              </text>

              {groupIndex > 0 && (
                <line
                  x1={groupX}
                  x2={groupX}
                  y1={padding.top - 2}
                  y2={padding.top + plotHeight}
                  className="task-chart__divider"
                />
              )}

              {chart.periods.map((period, periodIndex) => {
                const clusterX = groupX + clusterWidth * (periodIndex + 0.35);

                return (
                  <g key={period}>
                    {group.series.map((series, seriesIndex) => {
                      const value = series.values[periodIndex] ?? 0;
                      const barX = clusterX + seriesIndex * (barWidth + 2);

                      return (
                        <rect
                          key={series.id}
                          x={barX}
                          y={y(value)}
                          width={barWidth}
                          height={padding.top + plotHeight - y(value)}
                          className={`task-chart__bar task-chart__bar--${series.id}`}
                        >
                          <title>{`${group.label} ${period} ${series.label}: ${value} thousand`}</title>
                        </rect>
                      );
                    })}

                    <text
                      x={clusterX + barWidth}
                      y={padding.top + plotHeight + 18}
                      className="task-chart__period"
                    >
                      {period}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + plotHeight}
          y2={padding.top + plotHeight}
          className="task-chart__axis"
        />
        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={padding.top + plotHeight}
          className="task-chart__axis"
        />
      </svg>

      <ul className="task-chart__legend">
        <li>
          <span className="task-chart__swatch task-chart__swatch--full-time" aria-hidden="true" />
          Full-time education
        </li>
        <li>
          <span className="task-chart__swatch task-chart__swatch--part-time" aria-hidden="true" />
          Part-time education
        </li>
      </ul>

      <figcaption className="visually-hidden">
        {chart.groups
          .map((group) =>
            group.series
              .map(
                (series) =>
                  `${group.label} ${series.label}: ${chart.periods
                    .map((period, i) => `${period} ${series.values[i]} thousand`)
                    .join(', ')}`,
              )
              .join('. '),
          )
          .join('. ')}
      </figcaption>
    </figure>
  );
}
