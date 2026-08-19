import { AlertTriangle, Mic, Square } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { pickAudioFormat, isRecordingSupported, type AudioFormat } from '../../lib/audio';
import { formatClock } from '../../lib/format';
import './MicrophoneTester.css';

type TesterState = 'idle' | 'requesting' | 'listening' | 'denied' | 'unsupported';

interface TestResult {
  bytes: number;
  durationMs: number;
  format: AudioFormat;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Checks the microphone path end to end: permission, live input level, and a
 * short recording so the student can see the format and size a Speaking answer
 * will actually produce.
 */
export function MicrophoneTester() {
  const [state, setState] = useState<TesterState>('idle');
  const [level, setLevel] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [format] = useState<AudioFormat | null>(() => pickAudioFormat());

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startedAtRef = useRef(0);

  const teardown = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    recorderRef.current?.state === 'recording' && recorderRef.current.stop();
    recorderRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    void audioContextRef.current?.close();
    audioContextRef.current = null;

    setLevel(0);
  }, []);

  useEffect(() => teardown, [teardown]);

  const stop = useCallback(() => {
    teardown();
    setState('idle');
  }, [teardown]);

  const start = useCallback(async () => {
    if (!isRecordingSupported() || !format) {
      setState('unsupported');
      return;
    }

    setState('requesting');
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const context = new AudioContext();
      audioContextRef.current = context;

      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      startedAtRef.current = performance.now();

      const tick = () => {
        analyser.getByteTimeDomainData(buffer);

        // Peak deviation from the 128 midpoint, normalised to 0–1.
        let peak = 0;
        for (const sample of buffer) {
          peak = Math.max(peak, Math.abs(sample - 128) / 128);
        }

        setLevel(peak);
        setElapsedMs(performance.now() - startedAtRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: format.mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: format.mimeType });
        setResult({
          bytes: blob.size,
          durationMs: performance.now() - startedAtRef.current,
          format,
        });
      };
      recorder.start();
      recorderRef.current = recorder;

      setState('listening');
    } catch {
      teardown();
      setState('denied');
    }
  }, [format, teardown]);

  return (
    <div className="mic-tester">
      <div className="mic-tester__row">
        <div>
          <p className="mic-tester__format-label">Recording format</p>
          <p className="mic-tester__format">
            {format ? `${format.mimeType} → ${format.extension}` : 'No supported format'}
          </p>
        </div>

        {state === 'listening' ? (
          <button type="button" className="button button--reject" onClick={stop}>
            <Square size={15} aria-hidden="true" />
            Stop test
          </button>
        ) : (
          <button
            type="button"
            className="button button--primary"
            onClick={() => void start()}
            disabled={state === 'requesting'}
          >
            <Mic size={15} aria-hidden="true" />
            {state === 'requesting' ? 'Requesting…' : 'Test microphone'}
          </button>
        )}
      </div>

      <div className="mic-tester__meter" aria-hidden="true">
        <span
          className="mic-tester__meter-fill"
          style={{ width: `${Math.min(100, Math.round(level * 140))}%` }}
        />
      </div>
      <p className="mic-tester__meter-caption">
        {state === 'listening'
          ? `Listening · ${formatClock(elapsedMs / 1000)} — say something and watch the level move.`
          : 'Input level'}
      </p>

      {state === 'denied' && (
        <p className="mic-tester__alert" role="alert">
          <AlertTriangle size={15} aria-hidden="true" />
          Microphone access was blocked. Allow it in your browser settings, then
          test again.
        </p>
      )}

      {state === 'unsupported' && (
        <p className="mic-tester__alert" role="alert">
          <AlertTriangle size={15} aria-hidden="true" />
          This browser cannot record audio. Speaking tasks need a browser with
          MediaRecorder support.
        </p>
      )}

      {result && (
        <dl className="mic-tester__result">
          <div>
            <dt>Test length</dt>
            <dd>{formatClock(result.durationMs / 1000)}</dd>
          </div>
          <div>
            <dt>File size</dt>
            <dd>{formatBytes(result.bytes)}</dd>
          </div>
          <div>
            <dt>Container</dt>
            <dd>{result.format.container}</dd>
          </div>
          <div>
            <dt>Estimated per minute</dt>
            <dd>
              {result.durationMs > 0
                ? formatBytes(Math.round((result.bytes / result.durationMs) * 60_000))
                : '—'}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
