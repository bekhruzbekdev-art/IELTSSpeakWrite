export type UnlockRequestStatus = 'pending' | 'approved' | 'rejected';

export interface UnlockRequest {
  id: string;
  studentId: string;
  studentName: string;
  cohortId: string;
  /** The day the student is asking to open, 1–30. */
  day: number;
  reason: string;
  status: UnlockRequestStatus;
  createdAt: string;
  /** Set when a reviewer acts on it. */
  decidedAt?: string;
  decidedBy?: string;
  decisionNote?: string;
}

export type MessageAuthor = 'student' | 'staff';

export interface SupportMessage {
  id: string;
  threadId: string;
  author: MessageAuthor;
  authorName: string;
  body: string;
  sentAt: string;
}

export interface SupportThread {
  id: string;
  studentId: string;
  studentName: string;
  cohortId: string;
  subject: string;
  lastActivityAt: string;
  resolved: boolean;
}
