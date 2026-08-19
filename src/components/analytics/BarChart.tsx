import './charts.css';

export interface BarDatum {
  id: string;
  label: string;
  value: number;
  /** Optional value suffix, e.g. `errors`. */
  valueLabel?: string;
}

interface BarChartProps {
  title: string;
  description?: string;
  data: BarDatum[];
  max: number;
  /** Scale caption under the chart. */
  scaleLabel: string;
  /** Value renderer — band scores need one decimal, counts do not. */
  formatValue?: (value: number) => string;
}

/**
 * Horizontal bars, one hue for the whole series — bar length already encodes
 * magnitude, so colour is not spent re-encoding it. Values are labelled at the
 * end of every bar (only four to six bars here, so no label crowding).
 */
export function BarChart({
  title,
  description,
  data,
  max,
  scaleLabel,
  formatValue = (value) => String(value),
}: BarChartProps) {
  return (
    <figure className="chart">
      <figcaption className="chart__title">{title}</figcaption>
      {description && <p className="chart__description">{description}</p>}

      <ul className="bars">
        {data.map((datum) => (
          <li
            key={datum.id}
            className="bars__row"
            data-tooltip={`${datum.label}: ${formatValue(datum.value)}${
              datum.valueLabel ? ` ${datum.valueLabel}` : ''
            }`}
          >
            <span className="bars__label">{datum.label}</span>
            <span className="bars__track">
              <span
                className="bars__fill"
                style={{ width: `${Math.max(2, (datum.value / max) * 100)}%` }}
              />
            </span>
            <span className="bars__value">{formatValue(datum.value)}</span>
          </li>
        ))}
      </ul>

      <p className="chart__scale">{scaleLabel}</p>
    </figure>
  );
}
