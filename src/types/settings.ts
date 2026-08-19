export interface NotificationPreferences {
  dailySprintAlerts: boolean;
  feedbackAlerts: boolean;
  unlockDecisionAlerts: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastSeenAt: string;
  isCurrent: boolean;
}
