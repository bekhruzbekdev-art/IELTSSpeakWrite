import { Check, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { WRITING_TASKS } from '../../data/startingPointTest';
import { countWords } from '../../lib/analysis';
import type { WritingResponse, WritingTask } from '../../types/exam';
import { ExamShell } from './ExamShell';
import { TaskChart } from './TaskChart';
import './WritingMock.css';

interface WritingMockProps {
  responses: WritingResponse[];
  remainingMs: number;
  onSave: (taskId: WritingTask['id'], text: string) => void;
  onRemaining: (ms: number) => void;
  onSubmit: (auto: boolean) => void;
  onExit: () => void;
}

type SaveState = 'idle' | 'saving' | 'saved';

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function WritingMock({
  responses,
  remainingMs,
  onSave,
  onRemaining,
  onSubmit,
  onExit,
}: WritingMockProps) {
  const [activeTaskId, setActiveTaskId] = useState<WritingTask['id']>('task-1');
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(responses.map((r) => [r.taskId, r.text])),
  );
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [remaining, setRemaining] = useState(remainingMs);

  const saveTimerRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

  const task = WRITING_TASKS.find((t) => t.id === activeTaskId) ?? WRITING_TASKS[0];
  const text = drafts[activeTaskId] ?? '';
  const words = countWords(text);

  // The 60:00 clock. Auto-submits exactly once at zero.
  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((left) => {
        const next = Math.max(0, left - 1000);
        onRemaining(next);

        if (next === 0 && !submittedRef.current) {
          submittedRef.current = true;
          onSubmit(true);
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [onRemaining, onSubmit]);

  useEffect(
    () => () => {
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    },
    [],
  );

  /** Every keystroke marks dirty, then settles to "Saved". */
  const handleChange = useCallback(
    (value: string) => {
      setDrafts((current) => ({ ...current, [activeTaskId]: value }));
      setSaveState('saving');

      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        onSave(activeTaskId, value);
        setSaveState('saved');
      }, 500);
    },
    [activeTaskId, onSave],
  );

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    // Flush whatever is in the box before marking.
    Object.entries(drafts).forEach(([id, value]) =>
      onSave(id as WritingTask['id'], value),
    );
    onSubmit(false);
  };

  if (!task) return null;

  const isLow = remaining <= 5 * 60 * 1000;

  return (
    <ExamShell
      title="Starting Point — Writing"
      progressLabel={`${task.label.toUpperCase()} — ${words} WORDS`}
      onExit={onExit}
      wide
      timer={
        <span className={`writing__timer${isLow ? ' writing__timer--low' : ''}`}>
          {formatCountdown(remaining)}
        </span>
      }
    >
      <div className="writing">
        <div className="writing__tabs">
          <div className="tabs" role="tablist" aria-label="Writing tasks">
            {WRITING_TASKS.map((t) => {
              const count = countWords(drafts[t.id] ?? '');
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={t.id === activeTaskId}
                  className="tabs__tab"
                  onClick={() => setActiveTaskId(t.id)}
                >
                  {t.label}
                  <span className="writing__tab-count">
                    {count}/{t.minWords}
                  </span>
                </button>
              );
            })}
          </div>

          <span className={`writing__save writing__save--${saveState}`} role="status">
            {saveState === 'saving' ? (
              <>
                <Loader2 size={13} aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <Check size={13} strokeWidth={3} aria-hidden="true" />
                Saved
              </>
            )}
          </span>
        </div>

        <div className="writing__split">
          <section className="writing__prompt-pane">
            <p className="writing__instructions">{task.instructions}</p>
            <p className="writing__prompt">{task.prompt}</p>
            {task.chart && <TaskChart chart={task.chart} />}
          </section>

          <section className="writing__editor-pane">
            <label className="visually-hidden" htmlFor={`editor-${task.id}`}>
              {task.label} answer
            </label>
            <textarea
              id={`editor-${task.id}`}
              className="writing__editor"
              value={text}
              onChange={(event) => handleChange(event.target.value)}
              spellCheck={false}
              placeholder="Type your answer here…"
            />
            <div className="writing__editor-foot">
              <span className={words < task.minWords ? 'writing__count--under' : undefined}>
                {words} words · minimum {task.minWords}
              </span>
              <button type="button" className="button button--primary" onClick={handleSubmit}>
                Submit Writing mock
              </button>
            </div>
          </section>
        </div>
      </div>
    </ExamShell>
  );
}
