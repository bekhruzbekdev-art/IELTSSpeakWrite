import type { LearningProfileNote, MockKind } from '../types/exam';

/**
 * Adaptive engine.
 *
 * The diagnostic decides what the early Sprint days emphasise. This maps a
 * weak sub-skill onto a focus tag that Day 1 (and later, days 2–5) can be
 * filtered by. It picks emphasis — it does not invent lesson content.
 */

export interface FocusTag {
  id: string;
  label: string;
  skill: MockKind | 'both';
  /** Why this focus was chosen, shown to the student. */
  because: string;
}

const FOCUS_BY_SUBSKILL: Record<string, Omit<FocusTag, 'because'>> = {
  'speaking.fluency_and_coherence': {
    id: 'fluency',
    label: 'Fluency drills',
    skill: 'speaking',
  },
  'speaking.lexical_resource': {
    id: 'speaking-vocab',
    label: 'Topic vocabulary',
    skill: 'speaking',
  },
  'speaking.grammatical_range_and_accuracy': {
    id: 'speaking-grammar',
    label: 'Spoken grammar',
    skill: 'speaking',
  },
  'speaking.pronunciation': {
    id: 'pronunciation',
    label: 'Pronunciation practice',
    skill: 'speaking',
  },
  'writing.task_achievement': {
    id: 'task-response',
    label: 'Task response & planning',
    skill: 'writing',
  },
  'writing.coherence_and_cohesion': {
    id: 'structure',
    label: 'Paragraphing & linking',
    skill: 'writing',
  },
  'writing.lexical_resource': {
    id: 'writing-vocab',
    label: 'Academic vocabulary',
    skill: 'writing',
  },
  'writing.grammatical_range_and_accuracy': {
    id: 'writing-grammar',
    label: 'Grammar accuracy',
    skill: 'writing',
  },
};

/** Error tags map onto the same focus vocabulary. */
const FOCUS_BY_ERROR_TAG: Record<string, string> = {
  'Subject-verb agreement': 'writing-grammar',
  Capitalisation: 'writing-grammar',
  Register: 'writing-vocab',
  Spacing: 'writing-grammar',
};

/**
 * The focuses Day 1 should lead with, weakest first. Returns an empty list
 * until the diagnostic has run — the Sprint stays generic until then.
 */
export function focusesFor(note: LearningProfileNote | null): FocusTag[] {
  if (!note) return [];

  const focuses: FocusTag[] = [];
  const seen = new Set<string>();

  for (const subSkill of note.weakestSubSkills) {
    const base = FOCUS_BY_SUBSKILL[subSkill.id];
    if (!base || seen.has(base.id)) continue;

    seen.add(base.id);
    focuses.push({
      ...base,
      because: `${subSkill.label} was your lowest ${subSkill.skill} criterion (band ${subSkill.band.toFixed(1)}).`,
    });

    if (focuses.length === 3) break;
  }

  for (const tag of note.recurringErrorTags) {
    const focusId = FOCUS_BY_ERROR_TAG[tag];
    if (!focusId || seen.has(focusId)) continue;

    const base = Object.values(FOCUS_BY_SUBSKILL).find((f) => f.id === focusId);
    if (!base) continue;

    seen.add(focusId);
    focuses.push({ ...base, because: `“${tag}” recurred in your writing.` });
    if (focuses.length === 4) break;
  }

  return focuses;
}
