import { Contrast, Minus, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { countWords } from '../../lib/analysis';
import type { Task1FontSize } from '../../lib/task1Storage';
import type { WritingTask1Question } from '../../types/writingTask1';
import './Task1ExamView.css';

const FONT_STEPS: Task1FontSize[] = ['sm', 'md', 'lg'];
const ZOOM_STEPS = [1, 1.5, 2, 3] as const;
const LOW_TIME_MS = 5 * 60 * 1000;

export interface Task1ExamViewProps {
  /** The tabs along the footer, in the order the candidate moves through them. */
  questions: WritingTask1Question[];
  activeQuestionId: string;
  /** Draft text keyed by question id. */
  drafts: Record<string, string>;
  remainingMs: number;
  fontSize: Task1FontSize;
  highContrast: boolean;
  /** Shown top-right, the way the real test shows the candidate's ID. */
  candidateName: string;
  candidateId: string;
  submitted?: boolean;
  onSelectQuestion: (id: string) => void;
  onChangeText: (id: string, text: string) => void;
  onTick: (remainingMs: number) => void;
  onFontSize: (size: Task1FontSize) => void;
  onHighContrast: (on: boolean) => void;
  onSubmit: () => void;
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Computer-delivered IELTS Academic Writing Task 1.
 *
 * Deliberately austere, because the real test is: a status bar, a 50/50 split
 * with the stimulus on the left and a plain textarea on the right, and a
 * footer that carries the part navigation. There is no rich-text toolbar, no
 * spellcheck, and no coaching of any kind — the candidate gets exactly the
 * affordances the exam gives them.
 */
export function Task1ExamView({
  questions,
  activeQuestionId,
  drafts,
  remainingMs,
  fontSize,
  highContrast,
  candidateName,
  candidateId,
  submitted = false,
  onSelectQuestion,
  onChangeText,
  onTick,
  onFontSize,
  onHighContrast,
  onSubmit,
}: Task1ExamViewProps) {
  const [zoom, setZoom] = useState(1);
  const [remaining, setRemaining] = useState(remainingMs);
  const expiredRef = useRef(false);

  const question = useMemo(
    () => questions.find((q) => q.id === activeQuestionId) ?? questions[0],
    [questions, activeQuestionId],
  );

  const text = question ? (drafts[question.id] ?? '') : '';
  const words = countWords(text);

  // The guide clock. Task 1 is not separately timed in the real test, so
  // reaching zero is advisory: it turns the clock red and stops there rather
  // than snatching the paper away.
  useEffect(() => {
    if (submitted) return undefined;

    const id = window.setInterval(
      () => setRemaining((left) => Math.max(0, left - 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [submitted]);

  // Reporting the clock upward is a side effect, so it stays out of the
  // updater above — an updater must be pure, and StrictMode double-invokes it.
  useEffect(() => {
    onTick(remaining);
    if (remaining === 0) expiredRef.current = true;
  }, [remaining, onTick]);

  // Reset the zoom when the candidate moves to a different visual, otherwise a
  // 3x zoom set on the bar chart carries over onto the process diagram.
  useEffect(() => setZoom(1), [activeQuestionId]);

  const stepFont = useCallback(
    (direction: 1 | -1) => {
      const index = FONT_STEPS.indexOf(fontSize);
      const next = FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, index + direction))];
      if (next) onFontSize(next);
    },
    [fontSize, onFontSize],
  );

  const stepZoom = useCallback((direction: 1 | -1) => {
    setZoom((current) => {
      const index = ZOOM_STEPS.indexOf(current as (typeof ZOOM_STEPS)[number]);
      const safeIndex = index === -1 ? 0 : index;
      return (
        ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, safeIndex + direction))] ?? 1
      );
    });
  }, []);

  if (!question) return null;

  const isLow = remaining <= LOW_TIME_MS;
  const editorId = `cd-answer-${question.id}`;

  return (
    <div
      className="cd"
      data-font={fontSize}
      data-contrast={highContrast ? 'high' : 'normal'}
    >
      {/* ---------------------------------------------------------------- *
       * Status bar
       * ---------------------------------------------------------------- */}
      <header className="cd__bar">
        <div className="cd__bar-left">
          <span
            className={`cd__clock${isLow ? ' cd__clock--low' : ''}`}
            role="timer"
            aria-live="off"
          >
            {formatCountdown(remaining)}
          </span>
          <span className="cd__clock-note">
            {remaining === 0 ? 'Guide time used' : 'minutes remaining'}
          </span>
        </div>

        <div className="cd__bar-right">
          <span className="cd__candidate">
            <span className="cd__candidate-name">{candidateName}</span>
            <span className="cd__candidate-id">{candidateId}</span>
          </span>

          <div className="cd__controls" role="group" aria-label="Display settings">
            <button
              type="button"
              className="cd__control"
              onClick={() => stepFont(-1)}
              disabled={fontSize === FONT_STEPS[0]}
              aria-label="Decrease text size"
              title="Decrease text size"
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="cd__control-label" aria-hidden="true">
              A
            </span>
            <button
              type="button"
              className="cd__control"
              onClick={() => stepFont(1)}
              disabled={fontSize === FONT_STEPS[FONT_STEPS.length - 1]}
              aria-label="Increase text size"
              title="Increase text size"
            >
              <Plus size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`cd__control${highContrast ? ' cd__control--on' : ''}`}
              onClick={() => onHighContrast(!highContrast)}
              aria-pressed={highContrast}
              aria-label="High contrast mode"
              title="High contrast mode"
            >
              <Contrast size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- *
       * 50/50 split — stimulus left, answer right
       * ---------------------------------------------------------------- */}
      <main className="cd__split">
        <section className="cd__pane cd__pane--question" aria-label="Question">
          <h1 className="cd__task-heading">{question.label}</h1>
          <p className="cd__prompt">{question.prompt}</p>

          <figure className="cd__figure">
            <div className="cd__figure-toolbar">
              <figcaption className="cd__figure-caption">{question.title}</figcaption>
              <div className="cd__zoom" role="group" aria-label="Zoom">
                <button
                  type="button"
                  className="cd__control"
                  onClick={() => stepZoom(-1)}
                  disabled={zoom === ZOOM_STEPS[0]}
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <ZoomOut size={14} aria-hidden="true" />
                </button>
                <span className="cd__zoom-level">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  className="cd__control"
                  onClick={() => stepZoom(1)}
                  disabled={zoom === ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <ZoomIn size={14} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="cd__figure-scroll">
              {/*
                At 100% the figure fits the pane but is never blown up past its
                own resolution — these are bitmaps from the source paper, and
                upscaling them only makes the axis labels mushy. Zooming in
                past 100% is an explicit request, and the box scrolls.
              */}
              <img
                className="cd__figure-image"
                src={question.imagePath}
                alt={question.imageAlt}
                width={question.imageWidth}
                height={question.imageHeight}
                style={
                  zoom === 1
                    ? { width: 'auto', maxWidth: '100%' }
                    : { width: `${question.imageWidth * zoom}px`, maxWidth: 'none' }
                }
              />
            </div>
          </figure>
        </section>

        <section className="cd__pane cd__pane--answer" aria-label="Your answer">
          <label className="visually-hidden" htmlFor={editorId}>
            {question.label} answer
          </label>
          {/* Plain textarea on purpose: the real CD test gives no formatting. */}
          <textarea
            id={editorId}
            className="cd__editor"
            value={text}
            onChange={(event) => onChangeText(question.id, event.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            disabled={submitted}
            placeholder=""
          />
          <div className="cd__editor-foot">
            <span
              className={`cd__wordcount${
                words < question.minWords ? ' cd__wordcount--under' : ''
              }`}
            >
              Word count: {words}
            </span>
            <span className="cd__wordcount-min">Minimum {question.minWords}</span>
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------------- *
       * Footer navigation
       * ---------------------------------------------------------------- */}
      <footer className="cd__foot">
        <nav className="cd__tabs" aria-label="Tasks">
          {questions.map((q) => {
            const count = countWords(drafts[q.id] ?? '');
            const active = q.id === question.id;
            return (
              <button
                key={q.id}
                type="button"
                className={`cd__tab${active ? ' cd__tab--active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelectQuestion(q.id)}
              >
                <span className="cd__tab-label">{q.label}</span>
                <span className="cd__tab-count">{count}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="cd__submit"
          onClick={onSubmit}
          disabled={submitted}
        >
          {submitted ? 'Submitted' : 'Submit'}
        </button>
      </footer>
    </div>
  );
}
