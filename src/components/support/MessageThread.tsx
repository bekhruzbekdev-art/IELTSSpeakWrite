import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import type { SupportMessage } from '../../types/support';
import './MessageThread.css';

interface MessageThreadProps {
  messages: SupportMessage[];
  /** Which side of the conversation the current user is on. */
  as: 'student' | 'staff';
  onSend: (body: string) => void;
  placeholder?: string;
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageThread({ messages, as, onSend, placeholder }: MessageThreadProps) {
  const [draft, setDraft] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    onSend(body);
    setDraft('');
  };

  return (
    <div className="thread">
      <ol className="thread__messages">
        {messages.length === 0 && (
          <li className="thread__empty">No messages yet. Start the conversation below.</li>
        )}
        {messages.map((message) => (
          <li
            key={message.id}
            className={`thread__message${
              message.author === as ? ' thread__message--own' : ''
            }`}
          >
            <div className="thread__bubble">
              <p className="thread__author">{message.authorName}</p>
              <p className="thread__body">{message.body}</p>
            </div>
            <time className="thread__time" dateTime={message.sentAt}>
              {timeLabel(message.sentAt)}
            </time>
          </li>
        ))}
      </ol>

      <form className="thread__composer" onSubmit={handleSubmit}>
        <input
          type="text"
          className="thread__input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder ?? 'Write a message…'}
          aria-label="Message"
        />
        <button type="submit" className="button button--primary" disabled={!draft.trim()}>
          <Send size={15} aria-hidden="true" />
          Send
        </button>
      </form>
    </div>
  );
}
