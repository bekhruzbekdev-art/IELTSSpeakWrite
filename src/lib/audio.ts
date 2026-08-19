/**
 * Audio capture readiness for Speaking tasks.
 *
 * No recording UI ships yet — this module fixes the contract so every future
 * recorder produces the same shape: Opus in a WebM or Ogg container.
 */

export type AudioContainer = 'webm' | 'ogg';

export interface AudioFormat {
  mimeType: string;
  container: AudioContainer;
  extension: '.webm' | '.ogg';
}

/** Preference order: Opus first, WebM before Ogg. */
export const SUPPORTED_AUDIO_FORMATS: AudioFormat[] = [
  { mimeType: 'audio/webm;codecs=opus', container: 'webm', extension: '.webm' },
  { mimeType: 'audio/webm', container: 'webm', extension: '.webm' },
  { mimeType: 'audio/ogg;codecs=opus', container: 'ogg', extension: '.ogg' },
  { mimeType: 'audio/ogg', container: 'ogg', extension: '.ogg' },
];

export interface AudioRecording {
  blob: Blob;
  format: AudioFormat;
  durationMs: number;
  recordedAt: string;
}

export function isRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices?.getUserMedia !== undefined
  );
}

/** The best format this browser can actually produce, or null if none. */
export function pickAudioFormat(): AudioFormat | null {
  if (!isRecordingSupported()) return null;

  for (const format of SUPPORTED_AUDIO_FORMATS) {
    if (MediaRecorder.isTypeSupported(format.mimeType)) return format;
  }
  return null;
}

/** Stable object name for a Speaking submission. */
export function speakingObjectName(
  day: number,
  part: number,
  format: AudioFormat,
): string {
  return `speaking/day-${day}/part-${part}${format.extension}`;
}
