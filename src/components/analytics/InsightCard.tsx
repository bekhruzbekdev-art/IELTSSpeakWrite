import { AlertTriangle, Info, TrendingUp } from 'lucide-react';
import type { Insight } from '../../types/analytics';
import './InsightCard.css';

const TONE_ICON = {
  positive: TrendingUp,
  attention: AlertTriangle,
  neutral: Info,
} as const;

/** Tone is signalled by an icon and the `kind` label, never by colour alone. */
export function InsightCard({ insight }: { insight: Insight }) {
  const Icon = TONE_ICON[insight.tone];

  return (
    <article className={`insight insight--${insight.tone}`}>
      <span className="insight__icon" aria-hidden="true">
        <Icon size={16} strokeWidth={2.5} />
      </span>
      <div className="insight__body">
        <p className="insight__kind">{insight.kind}</p>
        <h3 className="insight__headline">{insight.headline}</h3>
        <p className="insight__detail">{insight.detail}</p>
      </div>
    </article>
  );
}
