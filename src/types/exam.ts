/** Types for the diagnostic Starting Point Test. */

export type MockKind = 'speaking' | 'writing';

export type MockStatus = 'not-started' | 'in-progress' | 'submitted';

/* ------------------------------------------------------------------ *
 * Test content
 * ------------------------------------------------------------------ */

export type SpeakingPart = 1 | 2 | 3;

export interface SpeakingQuestion {
  id: string;
  part: SpeakingPart;
  /** Sub-topic heading shown in Part 1/3. */
  topic: string;
  prompt: string;
}

export interface CueCard {
  id: string;
  introduction: string;
  title: string;
  bullets: string[];
  closing: string;
  prepSeconds: number;
  speakSeconds: number;
}

export interface WritingTask {
  id: 'task-1' | 'task-2';
  label: string;
  minutesGuide: number;
  minWords: number;
  instructions: string;
  prompt: string;
  /** Task 1 only — the chart the candidate must describe. */
  chart?: ChartStimulus;
}

export interface ChartSeries {
  id: string;
  label: string;
  values: number[];
}

export interface ChartStimulus {
  title: string;
  yAxisLabel: string;
  unitNote: string;
  periods: string[];
  groups: { id: string; label: string; series: ChartSeries[] }[];
  max: number;
}

/* ------------------------------------------------------------------ *
 * Candidate responses
 * ------------------------------------------------------------------ */

export interface SpeakingAnswer {
  questionId: string;
  part: SpeakingPart;
  /** Milliseconds the candidate spoke. */
  durationMs: number;
  /** True when a recording was actually captured (mic available). */
  recorded: boolean;
  answeredAt: string;
}

export interface WritingResponse {
  taskId: WritingTask['id'];
  text: string;
  wordCount: number;
  updatedAt: string;
}

/* ------------------------------------------------------------------ *
 * Analysis — mirrors the examiner JSON contract exactly.
 * ------------------------------------------------------------------ */

export interface CriterionAnalysis {
  band: number;
  evidence: string[];
  strengths: string[];
  limitations: string[];
  next_priority: string;
}

export interface SpeakingAnalysis {
  test_type: 'IELTS Speaking';
  overall_band: number;
  criteria: {
    fluency_and_coherence: CriterionAnalysis;
    lexical_resource: CriterionAnalysis;
    grammatical_range_and_accuracy: CriterionAnalysis;
    pronunciation: CriterionAnalysis;
  };
  part_analysis: { part_1: string; part_2: string; part_3: string };
  top_3_priorities: string[];
  learning_profile_note: string;
  confidence: number;
}

export interface ImportantError {
  original: string;
  correction: string;
  category: string;
  explanation: string;
}

export interface WritingTaskAnalysis {
  criteria: {
    task_achievement: CriterionAnalysis;
    coherence_and_cohesion: CriterionAnalysis;
    lexical_resource: CriterionAnalysis;
    grammatical_range_and_accuracy: CriterionAnalysis;
  };
  important_errors: ImportantError[];
}

export interface WritingAnalysis {
  test_type: 'IELTS Writing';
  overall_band: number;
  /** Task 1 and Task 2 are assessed separately, then combined. */
  task_1: WritingTaskAnalysis;
  task_2: WritingTaskAnalysis;
  top_3_priorities: string[];
  learning_profile_note: string;
  confidence: number;
}

/* ------------------------------------------------------------------ *
 * Session state
 * ------------------------------------------------------------------ */

export interface SpeakingSession {
  status: MockStatus;
  /** Index into the flattened question list. */
  cursor: number;
  answers: SpeakingAnswer[];
  startedAt: string | null;
  submittedAt: string | null;
  analysis: SpeakingAnalysis | null;
}

export interface WritingSession {
  status: MockStatus;
  responses: WritingResponse[];
  startedAt: string | null;
  submittedAt: string | null;
  /** Milliseconds left on the 60:00 clock at the last save. */
  remainingMs: number;
  autoSubmitted: boolean;
  analysis: WritingAnalysis | null;
}

export interface StartingPointState {
  speaking: SpeakingSession;
  writing: WritingSession;
}

/** The aggregated diagnostic note that drives the adaptive engine. */
export interface LearningProfileNote {
  generatedAt: string;
  overallBand: number | null;
  speakingBand: number | null;
  writingBand: number | null;
  /** Lowest-scoring sub-skills, weakest first. */
  weakestSubSkills: { id: string; label: string; band: number; skill: MockKind }[];
  recurringErrorTags: string[];
  priorities: string[];
  note: string;
}
