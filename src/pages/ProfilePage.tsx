import { Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AvatarGlyph } from '../components/profile/AvatarGlyph';
import { AvatarPicker } from '../components/profile/AvatarPicker';
import { SprintStatusWidget } from '../components/profile/SprintStatusWidget';
import { PageHeader, SectionHeading, Surface } from '../components/ui/Surface';
import { demoAccount } from '../data/demo';
import { attendanceRateFor } from '../lib/attendance';
import { summarise } from '../lib/sprintProgress';
import { useAppData } from '../state/AppDataContext';
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
  const { progress, attendance } = useAppData();
  const [avatar, setAvatar] = useState<AvatarPreset>(demoAccount.avatar);
  const summary = useMemo(() => summarise(progress), [progress]);
  const rate = useMemo(
    () => attendanceRateFor('student-0417', attendance),
    [attendance],
  );

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

      <Surface padding="lg">
        <SectionHeading
          title="Live lesson attendance"
          description="Recorded by your teacher. Excused absences are not counted against you."
        />
        <div className="profile-page__attendance">
          <div className="profile-page__attendance-figure">
            <span className="profile-page__attendance-value">{rate.percentage}%</span>
            <span className="profile-page__attendance-caption">
              across {rate.recorded} recorded {rate.recorded === 1 ? 'lesson' : 'lessons'}
            </span>
          </div>
          <dl className="profile-page__attendance-breakdown">
            <div>
              <dt>Present</dt>
              <dd>{rate.present}</dd>
            </div>
            <div>
              <dt>Late</dt>
              <dd>{rate.late}</dd>
            </div>
            <div>
              <dt>Absent</dt>
              <dd>{rate.absent}</dd>
            </div>
            <div>
              <dt>Excused</dt>
              <dd>{rate.excused}</dd>
            </div>
          </dl>
        </div>
      </Surface>
    </div>
  );
}
