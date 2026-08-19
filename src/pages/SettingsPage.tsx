import { KeyRound, Laptop, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { MicrophoneTester } from '../components/settings/MicrophoneTester';
import { PageHeader, SectionHeading, Surface } from '../components/ui/Surface';
import { demoSessions } from '../data/demo';
import { formatDate } from '../lib/format';
import { useAppData } from '../state/AppDataContext';
import { useTheme } from '../theme/ThemeContext';
import type { NotificationPreferences } from '../types/settings';
import './SettingsPage.css';

const NOTIFICATION_ROWS: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}[] = [
  {
    key: 'dailySprintAlerts',
    label: 'Daily sprint alerts',
    description: 'A reminder when your next day opens and before it closes.',
  },
  {
    key: 'feedbackAlerts',
    label: 'Feedback alerts',
    description: 'When a teacher reviews a submission or adjusts a band.',
  },
  {
    key: 'unlockDecisionAlerts',
    label: 'Unlock request decisions',
    description: 'When a day unlock request is approved or rejected.',
  },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { notifications, setNotifications } = useAppData();
  const [passwordRequested, setPasswordRequested] = useState(false);

  return (
    <div className="settings-page">
      <PageHeader title="Settings" subtitle="Appearance, alerts, audio and your session" />

      <Surface padding="lg">
        <SectionHeading title="Theme" description="Applies to this browser." />
        <div className="settings-page__theme" role="radiogroup" aria-label="Theme">
          {(
            [
              { id: 'light', label: 'Light', Icon: Sun },
              { id: 'dark', label: 'Dark', Icon: Moon },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={theme === id}
              className={`settings-page__theme-option${
                theme === id ? ' settings-page__theme-option--on' : ''
              }`}
              onClick={() => setTheme(id)}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </Surface>

      <Surface padding="lg">
        <SectionHeading
          title="Notifications"
          description="Choose what you are told about."
        />
        <ul className="settings-page__toggles">
          {NOTIFICATION_ROWS.map(({ key, label, description }) => (
            <li key={key} className="settings-page__toggle-row">
              <div>
                <p className="settings-page__toggle-label">{label}</p>
                <p className="settings-page__toggle-description">{description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications[key]}
                aria-label={label}
                className={`switch${notifications[key] ? ' switch--on' : ''}`}
                onClick={() =>
                  setNotifications({ ...notifications, [key]: !notifications[key] })
                }
              >
                <span className="switch__knob" />
              </button>
            </li>
          ))}
        </ul>
      </Surface>

      <Surface padding="lg">
        <SectionHeading
          title="Microphone & audio"
          description="Check your recording setup before a Speaking task."
        />
        <MicrophoneTester />
      </Surface>

      <Surface padding="lg">
        <SectionHeading
          title="Sessions & password"
          description="Credentials are issued by your teacher, so changes go through them."
        />

        <ul className="settings-page__sessions">
          {demoSessions.map((session) => (
            <li key={session.id} className="settings-page__session">
              <span className="settings-page__session-icon" aria-hidden="true">
                <Laptop size={16} />
              </span>
              <div>
                <p className="settings-page__session-device">
                  {session.device}
                  {session.isCurrent && (
                    <span className="settings-page__session-tag">This device</span>
                  )}
                </p>
                <p className="settings-page__session-meta">
                  {session.location} · last active {formatDate(session.lastSeenAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="settings-page__password">
          <div>
            <p className="settings-page__toggle-label">Password change request</p>
            <p className="settings-page__toggle-description">
              Sends a request to your teacher. You cannot change it yourself.
            </p>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setPasswordRequested(true)}
            disabled={passwordRequested}
          >
            <KeyRound size={15} aria-hidden="true" />
            {passwordRequested ? 'Request sent' : 'Request change'}
          </button>
        </div>

        {passwordRequested && (
          <p className="settings-page__confirm" role="status">
            Sent. Your teacher will reset the password for{' '}
            <strong>{user?.username}</strong> and pass on the new one.
          </p>
        )}
      </Surface>
    </div>
  );
}
