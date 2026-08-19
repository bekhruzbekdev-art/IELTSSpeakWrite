import type { StartingPointState } from '../types/exam';

/**
 * Auto-save for the Starting Point Test.
 *
 * Exam progress is the one thing in this app that must survive a refresh or a
 * crash, so it goes to localStorage rather than the in-memory store. Writes
 * are debounced; reads are defensive, because a half-written or stale record
 * must never break the exam.
 */

const STORAGE_KEY = 'isws.starting-point.v1';
const SAVE_DEBOUNCE_MS = 400;

export const emptyStartingPointState: StartingPointState = {
  speaking: {
    status: 'not-started',
    cursor: 0,
    answers: [],
    startedAt: null,
    submittedAt: null,
    analysis: null,
  },
  writing: {
    status: 'not-started',
    responses: [],
    startedAt: null,
    submittedAt: null,
    remainingMs: 60 * 60 * 1000,
    autoSubmitted: false,
    analysis: null,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function loadStartingPointState(): StartingPointState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStartingPointState;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed['speaking']) || !isRecord(parsed['writing'])) {
      return emptyStartingPointState;
    }

    // Merge over the defaults so a record written by an older build still loads.
    return {
      speaking: { ...emptyStartingPointState.speaking, ...(parsed['speaking'] as object) },
      writing: { ...emptyStartingPointState.writing, ...(parsed['writing'] as object) },
    };
  } catch {
    return emptyStartingPointState;
  }
}

let timer: number | null = null;
let pending: StartingPointState | null = null;

function write(state: StartingPointState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode — the session still holds state in memory */
  }
}

/**
 * Debounced write — safe to call on every keystroke.
 *
 * Pass `immediate` for anything that must not be lost if the page goes away
 * in the next few hundred milliseconds: submitting a paper is the obvious
 * case, since it is followed straight away by a navigation.
 */
export function saveStartingPointState(
  state: StartingPointState,
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
export function flushStartingPointState(): void {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (pending) {
    write(pending);
    pending = null;
  }
}

export function clearStartingPointState(): void {
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
  pending = null;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}
