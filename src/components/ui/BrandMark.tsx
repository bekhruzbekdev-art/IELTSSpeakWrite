import './BrandMark.css';

interface BrandMarkProps {
  /** `stacked` is the login lockup, `inline` is the sidebar lockup. */
  variant?: 'stacked' | 'inline';
}

export function BrandMark({ variant = 'inline' }: BrandMarkProps) {
  return (
    <div className={`brand brand--${variant}`}>
      <span className="brand__badge" aria-hidden="true">
        ✦
      </span>
      <span className="brand__words">
        <span className="brand__line brand__line--top">IELTS</span>
        <span className="brand__line brand__line--main">SpeakWrite</span>
        <span className="brand__line brand__line--bottom">Sprint</span>
      </span>
    </div>
  );
}
