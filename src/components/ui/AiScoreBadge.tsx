import { Sparkles } from 'lucide-react';
import { formatBand } from '../../lib/format';
import './AiScoreBadge.css';

interface AiScoreBadgeProps {
  band: number;
  /** `inline` for a badge beside a value, `block` for a standalone figure. */
  variant?: 'inline' | 'block';
}

/**
 * Every band figure in this product is model-produced. It is always labelled
 * as an estimate awaiting teacher review — never presented as an IELTS result.
 */
export function AiScoreBadge({ band, variant = 'inline' }: AiScoreBadgeProps) {
  return (
    <span className={`ai-score ai-score--${variant}`}>
      <span className="ai-score__label">
        <Sparkles size={11} strokeWidth={2.5} aria-hidden="true" />
        Estimated Band Score
      </span>
      <span className="ai-score__value">{formatBand(band)}</span>
    </span>
  );
}

/** The standing caveat that accompanies any AI-produced figure on a page. */
export function AiPreviewNote({ className = '' }: { className?: string }) {
  return (
    <p className={`ai-preview-note ${className}`.trim()}>
      <Sparkles size={13} strokeWidth={2.5} aria-hidden="true" />
      <span>
        <strong>AI-generated preview.</strong> These estimates are produced by a
        model and are not official IELTS scores. Your teacher reviews and may
        adjust every band before it is final.
      </span>
    </p>
  );
}
