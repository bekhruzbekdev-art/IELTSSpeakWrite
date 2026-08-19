/** Preset avatars are moderation-safe silhouettes, not uploads. */
export type AvatarPreset = 'male' | 'female' | 'unspecified';

export interface Account {
  /** Teacher-provisioned. Read-only in the UI. */
  username: string;
  displayName: string;
  cohortName: string;
  avatar: AvatarPreset;
  startedOn: string;
}
