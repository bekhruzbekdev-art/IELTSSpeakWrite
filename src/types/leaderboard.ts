/** Cohort-scoped leaderboard. Entries are never full real names. */
export interface LeaderboardEntry {
  id: string;
  rank: number;
  /** Pseudonym or initials — never a full name, per the privacy scope. */
  displayName: string;
  points: number;
  completedDays: number;
  isCurrentUser: boolean;
}

export interface Cohort {
  id: string;
  name: string;
  memberCount: number;
  entries: LeaderboardEntry[];
}
