import { Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AvatarGlyph } from '../components/profile/AvatarGlyph';
import { AvatarPicker } from '../components/profile/AvatarPicker';
import { SprintStatusWidget } from '../components/profile/SprintStatusWidget';
import { PageHeader, SectionHeading, Surface } from '../components/ui/Surface';
import { demoAccount, demoProgress } from '../data/demo';
import { summarise } from '../lib/sprintProgress';
import type { AvatarPreset } from '../types/account';
import './ProfilePage.css';

/** Credentials are teacher-provisioned and cannot be edited here. */
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-field">
      <span className="profile-field__label">{label}</span>
      <span className="profile-field__value">
        {value}
        <Lock size={13} aria-hidden="true" />
      </span>
    </div>
  );
}

export function ProfilePage() {
  const [avatar, setAvatar] = useState<AvatarPreset>(demoAccount.avatar);
  const summary = useMemo(() => summarise(demoProgress), []);

  return (
    <div className="profile-page">
      <PageHeader title="Profile" subtitle="Your account and Sprint statistics" />

      <Surface padding="lg">
        <div className="profile-page__identity">
          <AvatarGlyph preset={avatar} size={64} />
          <div>
            <h2 className="profile-page__name">{demoAccount.username}</h2>
            <p className="profile-page__cohort">{demoAccount.cohortName}</p>
          </div>
        </div>

        <div className="profile-page__fields">
          <ReadOnlyField label="Username" value={demoAccount.username} />
          <ReadOnlyField label="Password" value="••••••••" />
        </div>

        <p className="profile-page__note">
          Your username and password are issued by your teacher and cannot be
          changed here. Ask your teacher if you need them reset.
        </p>
      </Surface>

      <Surface padding="lg">
        <SectionHeading
          title="Avatar"
          description="Choose a preset. There is no photo upload."
        />
        <AvatarPicker value={avatar} onChange={setAvatar} />
      </Surface>

      <Surface padding="lg">
        <SectionHeading title="Sprint status" />
        <SprintStatusWidget startedOn={demoAccount.startedOn} summary={summary} />
      </Surface>
    </div>
  );
}
