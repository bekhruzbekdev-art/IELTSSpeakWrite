import { Check } from 'lucide-react';
import type { AvatarPreset } from '../../types/account';
import { AvatarGlyph } from './AvatarGlyph';
import './AvatarPicker.css';

interface AvatarPickerProps {
  value: AvatarPreset;
  onChange: (preset: AvatarPreset) => void;
}

const PRESETS: { id: AvatarPreset; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'unspecified', label: 'Prefer not to say' },
];

/** Preset silhouettes only — no uploads, so nothing needs moderating. */
export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="avatar-picker" role="radiogroup" aria-label="Avatar">
      {PRESETS.map(({ id, label }) => {
        const selected = value === id;

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`avatar-picker__option${
              selected ? ' avatar-picker__option--selected' : ''
            }`}
            onClick={() => onChange(id)}
          >
            <AvatarGlyph preset={id} size={56} />
            <span className="avatar-picker__label">{label}</span>
            {selected && (
              <span className="avatar-picker__check" aria-hidden="true">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
