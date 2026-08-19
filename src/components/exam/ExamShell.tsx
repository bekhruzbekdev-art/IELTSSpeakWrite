import { AlertTriangle, CircleDot } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import './ExamShell.css';

interface ExamShellProps {
  title: string;
  /** e.g. `PART 1 — 2/12` */
  progressLabel: string;
  timer?: ReactNode;
  children: ReactNode;
  onExit: () => void;
  /** Hidden once the paper is submitted. */
  showExit?: boolean;
  /** The writing layout needs the extra width for its two panes. */
  wide?: boolean;
}

/**
 * EXAM MODE.
 *
 * Locks the candidate into the paper: the app chrome is gone, a browser-level
 * unload warning is armed, and leaving takes a deliberate confirmation. There
 * is deliberately no coaching of any kind inside this shell — no hints, no
 * vocabulary help, no running feedback.
 */
export function ExamShell({
  title,
  progressLabel,
  timer,
  children,
  onExit,
  showExit = true,
  wide = false,
}: ExamShellProps) {
  const [confirming, setConfirming] = useState(false);

  // Warn on refresh/close. Progress is auto-saved, but the warning still helps.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  return (
    <div className="exam-shell">
      <header className="exam-shell__bar">
        <span className="exam-shell__mode">
          <CircleDot size={13} strokeWidth={3} aria-hidden="true" />
          Exam mode
        </span>

        <div className="exam-shell__identity">
          <p className="exam-shell__title">{title}</p>
          <p className="exam-shell__progress">{progressLabel}</p>
        </div>

        <div className="exam-shell__right">
          {timer}
          {showExit && (
            <button
              type="button"
              className="exam-shell__exit"
              onClick={() => setConfirming(true)}
            >
              Exit
            </button>
          )}
        </div>
      </header>

      <main className={`exam-shell__body${wide ? ' exam-shell__body--wide' : ''}`}>
        {children}
      </main>

      {confirming && (
        <div className="exam-shell__overlay" role="presentation">
          <div
            className="exam-shell__dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="exit-title"
          >
            <span className="exam-shell__dialog-icon" aria-hidden="true">
              <AlertTriangle size={20} />
            </span>
            <h2 id="exit-title" className="exam-shell__dialog-title">
              Leave the exam?
            </h2>
            <p className="exam-shell__dialog-text">
              Your progress is saved and you can return to this point. The test
              will not be marked until you submit it.
            </p>
            <div className="exam-shell__dialog-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setConfirming(false)}
              >
                Stay in the exam
              </button>
              <button type="button" className="button button--reject" onClick={onExit}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
