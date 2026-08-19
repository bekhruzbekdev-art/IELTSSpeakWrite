import { Mic, Play, Square } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PART_1_QUESTIONS,
  PART_2_CLOSING,
  PART_2_CUE_CARD,
  PART_3_QUESTIONS,
} from '../../data/startingPointTest';
import { pickAudioFormat } from '../../lib/audio';
import { speakExaminerPrompt, type SpeakHandle } from '../../lib/examinerVoice';
import { formatClock } from '../../lib/format';
import type { SpeakingAnswer, SpeakingPart } from '../../types/exam';
import { ExamShell } from './ExamShell';
import './SpeakingMock.css';

/** One flattened step of the paper. */
type Step =
  | { kind: 'question'; id: string; part: SpeakingPart; topic: string; prompt: string }
  | { kind: 'cue-card' };

const STEPS: Step[] = [
  ...PART_1_QUESTIONS.map((q) => ({ kind: 'question' as const, ...q })),
  { kind: 'cue-card' as const },
  ...PART_3_QUESTIONS.map((q) => ({ kind: 'question' as const, ...q })),
];

/**
 * Phase machine. There is no manual "Next" — the only control the candidate
 * has is Play (to hear the examiner) and Stop Answer.
 */
type Phase =
  | 'ready'      // waiting for the candidate to play the examiner prompt
  | 'examiner'   // examiner audio playing; mic off
  | 'prep'       // Part 2 only: 60s preparation, mic off
  | 'recording'  // mic live
  | 'finished';

interface SpeakingMockProps {
  startCursor: number;
  onAnswer: (answer: SpeakingAnswer) => void;
  onCursor: (cursor: number) => void;
  onSubmit: () => void;
  onExit: () => void;
}

export function SpeakingMock({
  startCursor,
  onAnswer,
  onCursor,
  onSubmit,
  onExit,
}: SpeakingMockProps) {
  const [cursor, setCursor] = useState(Math.min(startCursor, STEPS.length - 1));
  const [phase, setPhase] = useState<Phase>('ready');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [prepLeft, setPrepLeft] = useState(PART_2_CUE_CARD.prepSeconds);
  const [micReady, setMicReady] = useState<boolean | null>(null);

  const speakRef = useRef<SpeakHandle | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startedAtRef = useRef(0);
  const tickRef = useRef<number | null>(null);

  const step = STEPS[cursor];
  const isCueCard = step?.kind === 'cue-card';
  const part: SpeakingPart = isCueCard ? 2 : step?.part ?? 1;

  const partLabel = (() => {
    if (part === 2) return 'PART 2 — LONG TURN';
    const list = part === 1 ? PART_1_QUESTIONS : PART_3_QUESTIONS;
    const index = list.findIndex((q) => step?.kind === 'question' && q.id === step.id);
    return `PART ${part} — ${index + 1}/${list.length}`;
  })();

  const stopMedia = useCallback(() => {
    recorderRef.current?.state === 'recording' && recorderRef.current.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    tickRef.current = null;
  }, []);

  useEffect(
    () => () => {
      speakRef.current?.cancel();
      stopMedia();
    },
    [stopMedia],
  );

  /** Opens the mic and starts the clock. Falls through if permission fails. */
  const startRecording = useCallback(async () => {
    setElapsedMs(0);
    startedAtRef.current = performance.now();
    setPhase('recording');

    tickRef.current = window.setInterval(
      () => setElapsedMs(performance.now() - startedAtRef.current),
      250,
    );

    const format = pickAudioFormat();
    if (!format) {
      setMicReady(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: format.mimeType });
      recorder.start();
      recorderRef.current = recorder;
      setMicReady(true);
    } catch {
      // No mic, or permission denied — the exam continues and timing is kept.
      setMicReady(false);
    }
  }, []);

  /** Plays the examiner prompt, then hands over to the mic automatically. */
  const playExaminer = useCallback(() => {
    if (!step) return;

    setPhase('examiner');
    const text = isCueCard
      ? `${PART_2_CUE_CARD.introduction} ${PART_2_CUE_CARD.title}`
      : step.prompt;

    speakRef.current = speakExaminerPrompt(text, () => {
      if (isCueCard) {
        setPrepLeft(PART_2_CUE_CARD.prepSeconds);
        setPhase('prep');
      } else {
        void startRecording();
      }
    });
  }, [step, isCueCard, startRecording]);

  // Part 2 preparation countdown → recording starts by itself.
  useEffect(() => {
    if (phase !== 'prep') return;

    const id = window.setInterval(() => {
      setPrepLeft((left) => {
        if (left <= 1) {
          window.clearInterval(id);
          void startRecording();
          return 0;
        }
        return left - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase, startRecording]);

  const commitAnswer = useCallback(
    (durationMs: number) => {
      if (!step) return;
      onAnswer({
        questionId: isCueCard ? PART_2_CUE_CARD.id : step.id,
        part,
        durationMs,
        recorded: micReady === true,
        answeredAt: new Date().toISOString(),
      });
    },
    [step, isCueCard, part, micReady, onAnswer],
  );

  /** Stop Answer → commit, then move straight on to the next prompt. */
  const stopAnswer = useCallback(() => {
    const durationMs = performance.now() - startedAtRef.current;
    stopMedia();
    commitAnswer(durationMs);

    const next = cursor + 1;
    if (next >= STEPS.length) {
      setPhase('finished');
      return;
    }

    setCursor(next);
    onCursor(next);
    setPhase('ready');
    setElapsedMs(0);
  }, [cursor, commitAnswer, onCursor, stopMedia]);

  // Part 2 stops itself at two minutes.
  useEffect(() => {
    if (phase !== 'recording' || !isCueCard) return;
    if (elapsedMs < PART_2_CUE_CARD.speakSeconds * 1000) return;

    stopAnswer();
  }, [phase, isCueCard, elapsedMs, stopAnswer]);

  if (phase === 'finished') {
    return (
      <ExamShell
        title="Starting Point — Speaking"
        progressLabel="COMPLETE"
        onExit={onExit}
        showExit={false}
      >
        <div className="speaking__done">
          <h1 className="speaking__done-title">That is the end of the Speaking test.</h1>
          <p className="speaking__done-text">
            Submit to see your estimated diagnostic band. You will not be able to
            change your answers afterwards.
          </p>
          <button type="button" className="button button--primary" onClick={onSubmit}>
            Submit Speaking mock
          </button>
        </div>
      </ExamShell>
    );
  }

  return (
    <ExamShell
      title="Starting Point — Speaking"
      progressLabel={partLabel}
      onExit={onExit}
      timer={
        phase === 'recording' ? (
          <span className="speaking__timer speaking__timer--live">
            <Mic size={14} aria-hidden="true" />
            {formatClock(elapsedMs / 1000)}
          </span>
        ) : phase === 'prep' ? (
          <span className="speaking__timer">Prep {formatClock(prepLeft)}</span>
        ) : undefined
      }
    >
      <div className="speaking">
        {isCueCard ? (
          <section className="speaking__cue">
            <p className="speaking__examiner-line">{PART_2_CUE_CARD.introduction}</p>
            <div className="speaking__cue-card">
              <h1 className="speaking__cue-title">{PART_2_CUE_CARD.title}</h1>
              <p className="speaking__cue-lead">You should say:</p>
              <ul className="speaking__cue-list">
                {PART_2_CUE_CARD.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p className="speaking__cue-closing">{PART_2_CUE_CARD.closing}</p>
            </div>
          </section>
        ) : (
          <section className="speaking__question">
            <p className="speaking__topic">{step?.kind === 'question' ? step.topic : ''}</p>
            <h1 className="speaking__prompt">{step?.kind === 'question' ? step.prompt : ''}</h1>
          </section>
        )}

        <div className="speaking__stage">
          {phase === 'ready' && (
            <button type="button" className="speaking__play" onClick={playExaminer}>
              <Play size={18} aria-hidden="true" />
              Play examiner
            </button>
          )}

          {phase === 'examiner' && (
            <p className="speaking__status" role="status">
              <span className="speaking__pulse" aria-hidden="true" />
              Examiner speaking… your microphone will start automatically.
            </p>
          )}

          {phase === 'prep' && (
            <div className="speaking__prep">
              <p className="speaking__status" role="status">
                Preparation time — {formatClock(prepLeft)} remaining. Microphone is off.
              </p>
              <p className="speaking__prep-hint">
                Recording starts by itself when the minute is up.
              </p>
            </div>
          )}

          {phase === 'recording' && (
            <div className="speaking__recording">
              <p className="speaking__status speaking__status--live" role="status">
                <span className="speaking__dot" aria-hidden="true" />
                Recording… {formatClock(elapsedMs / 1000)}
                {isCueCard &&
                  ` / ${formatClock(PART_2_CUE_CARD.speakSeconds)}`}
              </p>
              <button type="button" className="button button--reject" onClick={stopAnswer}>
                <Square size={15} aria-hidden="true" />
                Stop answer
              </button>
              {micReady === false && (
                <p className="speaking__mic-warning">
                  No microphone detected — your answer is being timed but not
                  recorded. The test continues.
                </p>
              )}
            </div>
          )}
        </div>

        {isCueCard && phase === 'recording' && (
          <p className="speaking__closing-note">{PART_2_CLOSING}</p>
        )}
      </div>
    </ExamShell>
  );
}
