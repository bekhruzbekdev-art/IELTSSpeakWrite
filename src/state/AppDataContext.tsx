import {
  createContext,
  useCallback,
  useContext,
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
import type { AttendanceMark, AttendanceStatus } from '../types/attendance';
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
