import type { AvatarPreset } from '../../types/account';
import './AvatarGlyph.css';

interface AvatarGlyphProps {
  preset: AvatarPreset;
  size?: number;
}

const LABELS: Record<AvatarPreset, string> = {
  male: 'Male silhouette',
  female: 'Female silhouette',
  unspecified: 'Unspecified silhouette',
};

/**
 * Head-and-shoulders silhouettes drawn inline. Presets only — there is no
 * upload path, so nothing user-supplied ever needs moderating.
 */
export function AvatarGlyph({ preset, size = 40 }: AvatarGlyphProps) {
  return (
    <span
      className="avatar-glyph"
      style={{ width: size, height: size }}
      role="img"
      aria-label={LABELS[preset]}
    >
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
        {preset === 'female' ? (
          <>
            <path d="M20 9c-5 0-7.5 3.2-7.5 7.6 0 3 1 5 2.2 6.2-1.2.6-1.8 1.5-1.8 2.6h14.2c0-1.1-.6-2-1.8-2.6 1.2-1.2 2.2-3.2 2.2-6.2C27.5 12.2 25 9 20 9Z" />
            <path d="M20 26.5c-5.4 0-9.8 3.2-10.9 7.7-.2.9.5 1.8 1.5 1.8h18.8c1 0 1.7-.9 1.5-1.8-1.1-4.5-5.5-7.7-10.9-7.7Z" />
          </>
        ) : preset === 'male' ? (
          <>
            <circle cx="20" cy="16" r="7" />
            <path d="M20 26c-5.4 0-9.8 3.2-10.9 7.7-.2.9.5 1.8 1.5 1.8h18.8c1 0 1.7-.9 1.5-1.8C29.8 29.2 25.4 26 20 26Z" />
          </>
        ) : (
          <>
            <circle cx="20" cy="16" r="6.4" opacity="0.85" />
            <path
              d="M20 26.2c-5.2 0-9.4 3.1-10.5 7.4-.2.9.5 1.7 1.4 1.7h18.2c.9 0 1.6-.8 1.4-1.7-1.1-4.3-5.3-7.4-10.5-7.4Z"
              opacity="0.85"
            />
          </>
        )}
      </svg>
    </span>
  );
}
