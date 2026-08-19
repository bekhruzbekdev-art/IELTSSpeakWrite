import { Check, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '../../lib/format';
import type { UnlockRequest } from '../../types/support';
import './UnlockRequestQueue.css';

interface UnlockRequestQueueProps {
  requests: UnlockRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
}

const STATUS_META = {
  pending: { label: 'Pending', tone: 'warning', Icon: Clock },
  approved: { label: 'Approved', tone: 'success', Icon: Check },
  rejected: { label: 'Rejected', tone: 'error', Icon: X },
} as const;

function StatusChip({ status }: { status: UnlockRequest['status'] }) {
  const { label, tone, Icon } = STATUS_META[status];
  return (
    <span className={`queue__status queue__status--${tone}`}>
      <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
      {label}
    </span>
  );
}

export function UnlockRequestQueue({
  requests,
  onApprove,
  onReject,
}: UnlockRequestQueueProps) {
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState('');

  if (requests.length === 0) {
    return <p className="queue__empty">No unlock requests to review.</p>;
  }

  return (
    <ul className="queue">
      {requests.map((request) => (
        <li key={request.id} className="queue__item">
          <div className="queue__head">
            <div>
              <p className="queue__student">
                {request.studentName}
                <span className="queue__day">Day {request.day}</span>
              </p>
              <p className="queue__meta">
                Requested {formatDate(request.createdAt)}
                {request.decidedBy && ` · decided by ${request.decidedBy}`}
              </p>
            </div>
            <StatusChip status={request.status} />
          </div>

          <p className="queue__reason">“{request.reason}”</p>

          {request.decisionNote && (
            <p className="queue__note">Reviewer note: {request.decisionNote}</p>
          )}

          {request.status === 'pending' && (
            <>
              {rejecting === request.id ? (
                <div className="queue__reject-form">
                  <label className="visually-hidden" htmlFor={`note-${request.id}`}>
                    Reason for rejecting
                  </label>
                  <input
                    id={`note-${request.id}`}
                    type="text"
                    className="queue__input"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Tell the student why (optional)"
                  />
                  <button
                    type="button"
                    className="button button--reject"
                    onClick={() => {
                      onReject(request.id, note.trim());
                      setRejecting(null);
                      setNote('');
                    }}
                  >
                    Confirm reject
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => {
                      setRejecting(null);
                      setNote('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="queue__actions">
                  <button
                    type="button"
                    className="button button--approve"
                    onClick={() => onApprove(request.id)}
                  >
                    <Check size={15} aria-hidden="true" />
                    Approve
                  </button>
                  <button
                    type="button"
                    className="button button--reject"
                    onClick={() => setRejecting(request.id)}
                  >
                    <X size={15} aria-hidden="true" />
                    Reject
                  </button>
                </div>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
