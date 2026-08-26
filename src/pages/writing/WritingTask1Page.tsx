import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Task1ExamView } from '../../components/writing/Task1ExamView';
import { WRITING_TASK_1_QUESTIONS } from '../../data/writingTask1Data';
import { countWords } from '../../lib/analysis';
import {
  flushTask1State,
  loadTask1State,
  saveTask1State,
  type Task1FontSize,
  type Task1ModuleState,
} from '../../lib/task1Storage';

/**
 * Owns the Task 1 module's state.
 *
 * The paper lives in localStorage rather than the in-memory app store, for the
 * same reason the Starting Point Test does: a refresh mid-answer must not cost
 * the candidate their writing.
 */
export function WritingTask1Page() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState<Task1ModuleState>(loadTask1State);

  // Every state change is a save. `submittedAt` is the one transition that
  // cannot afford the debounce, because it is followed by a navigation.
  const update = useCallback(
    (
      change: (current: Task1ModuleState) => Task1ModuleState,
      { immediate = false }: { immediate?: boolean } = {},
    ) => {
      setState((current) => {
        const next = change(current);
        saveTask1State(next, { immediate });
        return next;
      });
    },
    [],
  );

  // Stamp the start once, on first mount of an unstarted paper.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    update((current) =>
      current.startedAt ? current : { ...current, startedAt: new Date().toISOString() },
    );
  }, [update]);

  // A debounced write is still pending when the tab goes away; flush it.
  useEffect(() => {
    const flush = () => flushTask1State();
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      flush();
    };
  }, []);

  const drafts = Object.fromEntries(
    Object.entries(state.responses).map(([id, response]) => [id, response.text]),
  );

  const handleChangeText = useCallback(
    (id: string, text: string) => {
      update((current) => ({
        ...current,
        responses: {
          ...current.responses,
          [id]: {
            questionId: id,
            text,
            wordCount: countWords(text),
            updatedAt: new Date().toISOString(),
          },
        },
      }));
    },
    [update],
  );

  const handleSelectQuestion = useCallback(
    (id: string) => update((current) => ({ ...current, activeQuestionId: id })),
    [update],
  );

  const handleTick = useCallback(
    (remainingMs: number) => update((current) => ({ ...current, remainingMs })),
    [update],
  );

  const handleFontSize = useCallback(
    (fontSize: Task1FontSize) => update((current) => ({ ...current, fontSize })),
    [update],
  );

  const handleHighContrast = useCallback(
    (highContrast: boolean) => update((current) => ({ ...current, highContrast })),
    [update],
  );

  const handleSubmit = useCallback(() => {
    update((current) => ({ ...current, submittedAt: new Date().toISOString() }), {
      immediate: true,
    });
    navigate('/sprint');
  }, [update, navigate]);

  return (
    <Task1ExamView
      questions={WRITING_TASK_1_QUESTIONS}
      activeQuestionId={state.activeQuestionId}
      drafts={drafts}
      remainingMs={state.remainingMs}
      fontSize={state.fontSize}
      highContrast={state.highContrast}
      candidateName={user?.displayName ?? 'Candidate'}
      candidateId={user?.username ?? '—'}
      submitted={state.submittedAt !== null}
      onSelectQuestion={handleSelectQuestion}
      onChangeText={handleChangeText}
      onTick={handleTick}
      onFontSize={handleFontSize}
      onHighContrast={handleHighContrast}
      onSubmit={handleSubmit}
    />
  );
}
