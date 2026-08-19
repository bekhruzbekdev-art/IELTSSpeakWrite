/**
 * Examiner voice.
 *
 * No recorded audio ships with this build, so the examiner prompt is spoken
 * with the browser's speech synthesiser. Where that is unavailable the caller
 * falls back to a timed read of the printed prompt, so the flow never stalls.
 */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Roughly how long a read-aloud takes, used as the fallback timing. */
export function estimateSpeechMs(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1600, Math.round((words / 2.6) * 1000));
}

export interface SpeakHandle {
  cancel: () => void;
}

/**
 * Speaks `text`, then calls `onDone`. Always resolves — a synthesis error
 * falls through to the estimated duration rather than leaving the exam stuck.
 */
export function speakExaminerPrompt(text: string, onDone: () => void): SpeakHandle {
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    onDone();
  };

  if (!isSpeechSupported()) {
    const id = window.setTimeout(finish, estimateSpeechMs(text));
    return {
      cancel: () => {
        finished = true;
        window.clearTimeout(id);
      },
    };
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.lang = 'en-GB';
  utterance.onend = finish;
  utterance.onerror = finish;

  // Safety net: some engines never fire `onend` for long strings.
  const guard = window.setTimeout(finish, estimateSpeechMs(text) + 4000);

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => {
      finished = true;
      window.clearTimeout(guard);
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* already torn down */
      }
    },
  };
}
