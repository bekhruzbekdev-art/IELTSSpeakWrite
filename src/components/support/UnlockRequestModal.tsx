import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { SPRINT_DAYS } from '../../lib/sprintProgress';
import './UnlockRequestModal.css';

interface UnlockRequestModalProps {
  /** Days the student may ask for — locked days only. */
  eligibleDays: number[];
  onSubmit: (input: { day: number; reason: string }) => void;
  onClose: () => void;
}

const MIN_REASON_LENGTH = 12;

export function UnlockRequestModal({
  eligibleDays,
  onSubmit,
  onClose,
}: UnlockRequestModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [day, setDay] = useState<number>(eligibleDays[0] ?? 1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (reason.trim().length < MIN_REASON_LENGTH) {
      setError(`Please give a reason of at least ${MIN_REASON_LENGTH} characters.`);
      return;
    }

    onSubmit({ day, reason: reason.trim() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal__head">
          <h2 id={titleId} className="modal__title">
            Request a day unlock
          </h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <p className="modal__intro">
          A Support Teacher reviews every request. If it is approved the day opens
          immediately, without waiting for the usual order.
        </p>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="modal__field">
            <span className="modal__label">Day to unlock</span>
            <select
              className="modal__input"
              value={day}
              onChange={(event) => setDay(Number(event.target.value))}
            >
              {eligibleDays.map((value) => (
                <option key={value} value={value}>
                  Day {value}
                </option>
              ))}
            </select>
          </label>

          <label className="modal__field">
            <span className="modal__label">
              Reason <span className="modal__required">required</span>
            </span>
            <textarea
              className="modal__input modal__textarea"
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Tell your teacher why you could not complete this day."
            />
          </label>

          {error && (
            <p className="modal__error" role="alert">
              {error}
            </p>
          )}

          <footer className="modal__actions">
            <button type="button" className="button button--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="button button--primary"
              disabled={eligibleDays.length === 0}
            >
              Send request
            </button>
          </footer>
        </form>

        {eligibleDays.length === 0 && (
          <p className="modal__empty">
            Every day up to Day {SPRINT_DAYS} is already open to you.
          </p>
        )}
      </div>
    </div>
  );
}
