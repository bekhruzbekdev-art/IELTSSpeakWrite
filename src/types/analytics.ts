/** Learning Profile analytics. Every band figure is an AI estimate. */

export type SkillArea = 'writing' | 'speaking';

export interface CriterionScore {
  id: string;
  label: string;
  /** Band at the Starting Point Test. */
  start: number;
  /** Latest AI-estimated band. */
  current: number;
}

export interface SpeakingPartScore {
  id: string;
  label: string;
  band: number;
}

export interface ErrorTrendPoint {
  label: string;
  day: number;
  errors: number;
}

export type InsightTone = 'positive' | 'attention' | 'neutral';

export interface Insight {
  id: string;
  kind: string;
  headline: string;
  detail: string;
  tone: InsightTone;
}

export interface SubmissionSnapshot {
  day: number;
  label: string;
  estimatedBand: number;
  wordCount: number;
  grammarErrors: number;
  speakingDurationSeconds: number;
}

export interface LearningProfile {
  startingBand: number;
  currentBand: number;
  maxBand: number;
  writing: CriterionScore[];
  speaking: CriterionScore[];
  speakingParts: SpeakingPartScore[];
  errorTrend: ErrorTrendPoint[];
  insights: Insight[];
  comparison: { first: SubmissionSnapshot; latest: SubmissionSnapshot };
}
