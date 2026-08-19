import { LockOpen, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { MessageThread } from '../components/support/MessageThread';
import { UnlockRequestModal } from '../components/support/UnlockRequestModal';
import { UnlockRequestQueue } from '../components/support/UnlockRequestQueue';
import { PageHeader, SectionHeading, Surface } from '../components/ui/Surface';
import { formatDate } from '../lib/format';
import { buildJourney } from '../lib/sprintProgress';
import { useAppData } from '../state/AppDataContext';
import './SupportPage.css';

type StudentTab = 'ask' | 'unlock';

const STUDENT_THREAD_ID = 'thread-you';

function StudentSupportDesk() {
  const { user } = useAuth();
  const { messages, unlockRequests, progress, sendMessage, submitUnlockRequest } =
    useAppData();
  const [tab, setTab] = useState<StudentTab>('ask');
  const [modalOpen, setModalOpen] = useState(false);

  const threadMessages = messages.filter((m) => m.threadId === STUDENT_THREAD_ID);
  const myRequests = unlockRequests.filter((r) => r.studentId === 'student-0417');

  // Only days that are actually shut can be requested.
  const eligibleDays = useMemo(
    () =>
      buildJourney(progress)
        .filter((card) => card.type === 'day' && card.status === 'LOCKED')
        .map((card) => card.day ?? 0)
        .filter((day) => day > 0),
    [progress],
  );

  return (
    <>
      <div className="support__tabs" role="tablist" aria-label="Support desk">
        <div className="tabs">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'ask'}
            className="tabs__tab"
            onClick={() => setTab('ask')}
          >
            <MessageCircle size={15} aria-hidden="true" />
            Ask a Question
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'unlock'}
            className="tabs__tab"
            onClick={() => setTab('unlock')}
          >
            <LockOpen size={15} aria-hidden="true" />
            Day Unlock Request
          </button>
        </div>
      </div>

      {tab === 'ask' ? (
        <Surface padding="lg">
          <SectionHeading
            title="Ask a question"
            description="Goes straight to your Support Teacher. Replies appear here."
          />
          <MessageThread
            messages={threadMessages}
            as="student"
            onSend={(body) =>
              sendMessage(STUDENT_THREAD_ID, body, 'student', user?.username ?? 'You')
            }
          />
        </Surface>
      ) : (
        <Surface padding="lg">
          <SectionHeading
            title="Day unlock requests"
            description="Ask a Support Teacher to open a day you could not reach."
            action={
              <button
                type="button"
                className="button button--primary"
                onClick={() => setModalOpen(true)}
              >
                <LockOpen size={15} aria-hidden="true" />
                New request
              </button>
            }
          />

          {myRequests.length === 0 ? (
            <p className="support__empty">
              You have not requested any day unlocks yet.
            </p>
          ) : (
            <ul className="support__requests">
              {myRequests.map((request) => (
                <li key={request.id} className="support__request">
                  <div>
                    <p className="support__request-day">Day {request.day}</p>
                    <p className="support__request-reason">{request.reason}</p>
                    <p className="support__request-meta">
                      Sent {formatDate(request.createdAt)}
                      {request.decisionNote && ` · ${request.decisionNote}`}
                    </p>
                  </div>
                  <span className={`support__chip support__chip--${request.status}`}>
                    {request.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      )}

      {modalOpen && (
        <UnlockRequestModal
          eligibleDays={eligibleDays}
          onSubmit={submitUnlockRequest}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

function StaffSupportDesk() {
  const { user } = useAuth();
  const { unlockRequests, threads, messages, approveUnlockRequest, rejectUnlockRequest, sendMessage } =
    useAppData();
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id ?? '');

  const pending = unlockRequests.filter((r) => r.status === 'pending');
  const decided = unlockRequests.filter((r) => r.status !== 'pending');
  const threadMessages = messages.filter((m) => m.threadId === activeThreadId);
  const reviewerName = user?.displayName ?? 'Staff';

  return (
    <>
      <Surface padding="lg">
        <SectionHeading
          title="Unlock request queue"
          description={`${pending.length} awaiting review. Approving opens the day immediately.`}
        />
        <UnlockRequestQueue
          requests={pending}
          onApprove={(id) => approveUnlockRequest(id, reviewerName)}
          onReject={(id, note) => rejectUnlockRequest(id, reviewerName, note)}
        />
      </Surface>

      <Surface padding="lg">
        <SectionHeading title="Support chats" description="Student questions." />
        <div className="support__chat-layout">
          <ul className="support__thread-list">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  className={`support__thread${
                    thread.id === activeThreadId ? ' support__thread--active' : ''
                  }`}
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  <span className="support__thread-name">{thread.studentName}</span>
                  <span className="support__thread-subject">{thread.subject}</span>
                  {thread.resolved && <span className="support__thread-tag">Resolved</span>}
                </button>
              </li>
            ))}
          </ul>

          <div className="support__chat-panel">
            <MessageThread
              messages={threadMessages}
              as="staff"
              onSend={(body) => sendMessage(activeThreadId, body, 'staff', reviewerName)}
              placeholder="Reply to the student…"
            />
          </div>
        </div>
      </Surface>

      {decided.length > 0 && (
        <Surface padding="lg">
          <SectionHeading title="Recent decisions" />
          <UnlockRequestQueue requests={decided} onApprove={() => {}} onReject={() => {}} />
        </Surface>
      )}
    </>
  );
}

export function SupportPage() {
  const { hasPermission } = useAuth();
  const isReviewer = hasPermission('unlock-request.review') || hasPermission('support.respond');

  return (
    <div className="support-page">
      <PageHeader
        title="Support"
        subtitle={
          isReviewer
            ? 'Answer student questions and review day unlock requests'
            : 'Ask your teacher a question or request a missed day'
        }
      />
      {isReviewer ? <StaffSupportDesk /> : <StudentSupportDesk />}
    </div>
  );
}
