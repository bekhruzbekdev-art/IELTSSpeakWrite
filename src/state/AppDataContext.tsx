import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  demoAttendance,
  demoProgress,
  demoSupportMessages,
  demoSupportThreads,
  demoUnlockRequests,
} from '../data/demo';
import { analyzeSpeaking, analyzeWriting, buildLearningProfileNote, countWords } from '../lib/analysis';
import {
  emptyStartingPointState,
  flushStartingPointState,
  loadStartingPointState,
  saveStartingPointState,
} from '../lib/examStorage';
import type { AttendanceMark, AttendanceStatus } from '../types/attendance';
import type {
  LearningProfileNote,
  SpeakingAnswer,
  StartingPointState,
  WritingTask,
} from '../types/exam';
import type { NotificationPreferences } from '../types/settings';
import type { SprintProgressState } from '../types/sprint';
import type {
  SupportMessage,
  SupportThread,
  UnlockRequest,
} from '../types/support';

/**
 * In-memory application state.
 *
 * This stands in for the API. State resets on reload — nothing is persisted,
 * because persisting it would only make the mock harder to reason about. Every
 * mutator here maps to one future endpoint.
 */

interface AppDataValue {
  progress: SprintProgressState;
  unlockRequests: UnlockRequest[];
  threads: SupportThread[];
  messages: SupportMessage[];
  attendance: AttendanceMark[];
  notifications: NotificationPreferences;

  /** Diagnostic test. Persisted to localStorage, not this store. */
  startingPoint: StartingPointState;
  learningProfileNote: LearningProfileNote | null;
  /** True while a mock is running — locks navigation. */
  examMode: boolean;

  beginSpeakingMock: () => void;
  recordSpeakingAnswer: (answer: SpeakingAnswer) => void;
  advanceSpeakingCursor: (cursor: number) => void;
  submitSpeakingMock: () => void;

  beginWritingMock: () => void;
  saveWritingResponse: (taskId: WritingTask['id'], text: string) => void;
  setWritingRemaining: (ms: number) => void;
  submitWritingMock: (auto?: boolean) => void;

  exitExamMode: () => void;
  resetStartingPoint: () => void;

  submitUnlockRequest: (input: { day: number; reason: string }) => void;
  approveUnlockRequest: (id: string, reviewerName: string) => void;
  rejectUnlockRequest: (id: string, reviewerName: string, note: string) => void;
  sendMessage: (threadId: string, body: string, author: 'student' | 'staff', authorName: string) => void;
  setAttendance: (mark: AttendanceMark) => void;
  setNotifications: (next: NotificationPreferences) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<SprintProgressState>(demoProgress);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>(demoUnlockRequests);
  const [threads, setThreads] = useState<SupportThread[]>(demoSupportThreads);
  const [messages, setMessages] = useState<SupportMessage[]>(demoSupportMessages);
  const [attendance, setAttendanceState] = useState<AttendanceMark[]>(demoAttendance);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    dailySprintAlerts: true,
    feedbackAlerts: true,
    unlockDecisionAlerts: true,
  });

  // Restored from localStorage so a refresh mid-exam loses nothing.
  const [startingPoint, setStartingPoint] = useState<StartingPointState>(
    loadStartingPointState,
  );
  const [examMode, setExamMode] = useState(false);

  /*
   * Every change to exam state is written straight back out. A submission is
   * written synchronously — it is immediately followed by a navigation, and a
   * debounced write would be lost if the page reloaded in between.
   */
  useEffect(() => {
    const submitted =
      startingPoint.speaking.status === 'submitted' ||
      startingPoint.writing.status === 'submitted';

    saveStartingPointState(startingPoint, { immediate: submitted });
  }, [startingPoint]);

  // A reload or tab close must not drop a debounced write either.
  useEffect(() => {
    const flush = () => flushStartingPointState();
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
    };
  }, []);

  const beginSpeakingMock = useCallback(() => {
    setExamMode(true);
    setStartingPoint((current) =>
      current.speaking.status === 'submitted'
        ? current
        : {
            ...current,
            speaking: {
              ...current.speaking,
              status: 'in-progress',
              startedAt: current.speaking.startedAt ?? new Date().toISOString(),
            },
          },
    );
  }, []);

  const recordSpeakingAnswer = useCallback((answer: SpeakingAnswer) => {
    setStartingPoint((current) => ({
      ...current,
      speaking: {
        ...current.speaking,
        answers: [
          ...current.speaking.answers.filter((a) => a.questionId !== answer.questionId),
          answer,
        ],
      },
    }));
  }, []);

  const advanceSpeakingCursor = useCallback((cursor: number) => {
    setStartingPoint((current) => ({
      ...current,
      speaking: { ...current.speaking, cursor },
    }));
  }, []);

  const submitSpeakingMock = useCallback(() => {
    setExamMode(false);
    setStartingPoint((current) => ({
      ...current,
      speaking: {
        ...current.speaking,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        analysis: analyzeSpeaking(current.speaking.answers),
      },
    }));
  }, []);

  const beginWritingMock = useCallback(() => {
    setExamMode(true);
    setStartingPoint((current) =>
      current.writing.status === 'submitted'
        ? current
        : {
            ...current,
            writing: {
              ...current.writing,
              status: 'in-progress',
              startedAt: current.writing.startedAt ?? new Date().toISOString(),
            },
          },
    );
  }, []);

  const saveWritingResponse = useCallback((taskId: WritingTask['id'], text: string) => {
    setStartingPoint((current) => ({
      ...current,
      writing: {
        ...current.writing,
        responses: [
          ...current.writing.responses.filter((r) => r.taskId !== taskId),
          {
            taskId,
            text,
            wordCount: countWords(text),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    }));
  }, []);

  const setWritingRemaining = useCallback((ms: number) => {
    setStartingPoint((current) =>
      current.writing.remainingMs === ms
        ? current
        : { ...current, writing: { ...current.writing, remainingMs: ms } },
    );
  }, []);

  const submitWritingMock = useCallback((auto = false) => {
    setExamMode(false);
    setStartingPoint((current) => ({
      ...current,
      writing: {
        ...current.writing,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        autoSubmitted: auto,
        analysis: analyzeWriting(current.writing.responses),
      },
    }));
  }, []);

  const exitExamMode = useCallback(() => setExamMode(false), []);

  const resetStartingPoint = useCallback(() => {
    setExamMode(false);
    setStartingPoint(emptyStartingPointState);
  }, []);

  // The diagnostic note is derived, never stored separately.
  const learningProfileNote = useMemo(
    () =>
      startingPoint.speaking.analysis || startingPoint.writing.analysis
        ? buildLearningProfileNote(
            startingPoint.speaking.analysis,
            startingPoint.writing.analysis,
          )
        : null,
    [startingPoint.speaking.analysis, startingPoint.writing.analysis],
  );

  const submitUnlockRequest = useCallback(
    ({ day, reason }: { day: number; reason: string }) => {
      setUnlockRequests((current) => [
        {
          id: nextId('req'),
          studentId: 'student-0417',
          studentName: 'B. M.',
          cohortId: 'cohort-b',
          day,
          reason,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
    },
    [],
  );

  const approveUnlockRequest = useCallback(
    (id: string, reviewerName: string) => {
      // Read the request BEFORE updating. State updaters must stay pure —
      // assigning to an outer variable from inside one is not reliable, and
      // StrictMode double-invokes them.
      const request = unlockRequests.find(
        (candidate) => candidate.id === id && candidate.status === 'pending',
      );
      if (!request) return;

      const { day } = request;

      setUnlockRequests((current) =>
        current.map((candidate) =>
          candidate.id === id && candidate.status === 'pending'
            ? {
                ...candidate,
                status: 'approved',
                decidedAt: new Date().toISOString(),
                decidedBy: reviewerName,
              }
            : candidate,
        ),
      );

      /*
       * Approval is what actually opens the day in the journey engine.
       *
       * The mock store holds one student's progress, so every approval lands
       * on it. A real implementation applies the unlock to request.studentId.
       */
      setProgress((current) =>
        current.staffUnlockedDays.includes(day)
          ? current
          : {
              ...current,
              staffUnlockedDays: [...current.staffUnlockedDays, day].sort(
                (a, b) => a - b,
              ),
            },
      );
    },
    [unlockRequests],
  );

  const rejectUnlockRequest = useCallback(
    (id: string, reviewerName: string, note: string) => {
      setUnlockRequests((current) =>
        current.map((request) =>
          request.id === id && request.status === 'pending'
            ? {
                ...request,
                status: 'rejected',
                decidedAt: new Date().toISOString(),
                decidedBy: reviewerName,
                decisionNote: note,
              }
            : request,
        ),
      );
    },
    [],
  );

  const sendMessage = useCallback(
    (
      threadId: string,
      body: string,
      author: 'student' | 'staff',
      authorName: string,
    ) => {
      const sentAt = new Date().toISOString();
      setMessages((current) => [
        ...current,
        { id: nextId('msg'), threadId, author, authorName, body, sentAt },
      ]);
      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId ? { ...thread, lastActivityAt: sentAt } : thread,
        ),
      );
    },
    [],
  );

  const setAttendance = useCallback((mark: AttendanceMark) => {
    setAttendanceState((current) => {
      const index = current.findIndex(
        (entry) => entry.studentId === mark.studentId && entry.date === mark.date,
      );
      if (index === -1) return [...current, mark];

      const next = [...current];
      next[index] = mark;
      return next;
    });
  }, []);

  const value = useMemo<AppDataValue>(
    () => ({
      progress,
      unlockRequests,
      threads,
      messages,
      attendance,
      notifications,
      startingPoint,
      learningProfileNote,
      examMode,
      beginSpeakingMock,
      recordSpeakingAnswer,
      advanceSpeakingCursor,
      submitSpeakingMock,
      beginWritingMock,
      saveWritingResponse,
      setWritingRemaining,
      submitWritingMock,
      exitExamMode,
      resetStartingPoint,
      submitUnlockRequest,
      approveUnlockRequest,
      rejectUnlockRequest,
      sendMessage,
      setAttendance,
      setNotifications,
    }),
    [
      progress,
      unlockRequests,
      threads,
      messages,
      attendance,
      notifications,
      startingPoint,
      learningProfileNote,
      examMode,
      beginSpeakingMock,
      recordSpeakingAnswer,
      advanceSpeakingCursor,
      submitSpeakingMock,
      beginWritingMock,
      saveWritingResponse,
      setWritingRemaining,
      submitWritingMock,
      exitExamMode,
      resetStartingPoint,
      submitUnlockRequest,
      approveUnlockRequest,
      rejectUnlockRequest,
      sendMessage,
      setAttendance,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside an AppDataProvider');
  return context;
}

export type { AttendanceStatus };
