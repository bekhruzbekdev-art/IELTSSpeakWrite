import { WRITING_TASK_1_QUESTIONS, TASK_1_TOTAL_MS } from '../data/writingTask1Data';

/**
 * Auto-save for the Academic Writing Task 1 module.
 *
 * Same contract as `examStorage`: debounced writes, defensive reads, and an
 * `immediate` escape hatch for anything followed straight away by a
 * navigation. A half-written or stale record must never break the paper, so
 * every read merges over a known-good default.
 */

const STORAGE_KEY = 'isws.writing-task-1.v1';
const SAVE_DEBOUNCE_MS = 400;

export type Task1FontSize = 'sm' | 'md' | 'lg';

export interface Task1Response {
  questionId: string;
  text: string;
  wordCount: number;
  updatedAt: string;
}

export interface Task1ModuleState {
  activeQuestionId: string;
  responses: Record<string, Task1Response>;
  startedAt: string | null;
  submittedAt: string | null;
  /** Milliseconds left on the 20:00 guide clock at the last save. */
  remainingMs: number;
  /** Accessibility controls, mirroring the real test's on-screen settings. */
  fontSize: Task1FontSize;
  highContrast: boolean;
}

export const emptyTask1State: Task1ModuleState = {
  activeQuestionId: WRITING_TASK_1_QUESTIONS[0]?.id ?? 'task-1a',
  responses: {},
  startedAt: null,
  submittedAt: null,
  remainingMs: TASK_1_TOTAL_MS,
  fontSize: 'md',
  highContrast: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function loadTask1State(): Task1ModuleState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyTask1State;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return emptyTask1State;

    // Merge over the defaults so a record written by an older build still loads.
    const merged: Task1ModuleState = { ...emptyTask1State, ...(parsed as object) };

    // A question can be removed from the bank between builds; never leave the
    // view pointing at one that no longer exists.
    const known = WRITING_TASK_1_QUESTIONS.some((q) => q.id === merged.activeQuestionId);
    if (!known) merged.activeQuestionId = emptyTask1State.activeQuestionId;

    if (!isRecord(merged.responses)) merged.responses = {};
    return merged;
  } catch {
    return emptyTask1State;
  }
}

let timer: number | null = null;
let pending: Task1ModuleState | null = null;

function write(state: Task1ModuleState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode — the session still holds state in memory */
  }
}

/** Debounced write — safe to call on every keystroke. */
export function saveTask1State(
  state: Task1ModuleState,
  { immediate = false }: { immediate?: boolean } = {},
): void {
  if (timer !== null) window.clearTimeout(timer);

  if (immediate) {
    pending = null;
    timer = null;
    write(state);
    return;
  }

  pending = state;
  timer = window.setTimeout(() => {
    timer = null;
    if (pending) write(pending);
    pending = null;
  }, SAVE_DEBOUNCE_MS);
}

/** Writes any debounced state out now. Called when the page is going away. */
export function flushTask1State(): void {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (pending) {
    write(pending);
    pending = null;
  }
}

export function clearTask1State(): void {
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
  pending = null;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}
