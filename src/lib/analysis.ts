import { WRITING_TASKS } from '../data/startingPointTest';
import type {
  CriterionAnalysis,
  ImportantError,
  LearningProfileNote,
  SpeakingAnalysis,
  SpeakingAnswer,
  WritingAnalysis,
  WritingResponse,
  WritingTaskAnalysis,
} from '../types/exam';

/**
 * ============================================================================
 * DIAGNOSTIC ANALYZER — HEURISTIC, NOT A MODEL.
 * ============================================================================
 *
 * No scoring model is wired up in this build. Rather than invent bands, the
 * functions below derive an indicative range from the few things the client
 * can actually measure:
 *
 *   Speaking — how long the candidate spoke per part, how many prompts were
 *              answered, whether audio was captured at all.
 *   Writing  — word counts against the task minimums, paragraphing, sentence
 *              length spread, and a small set of literal pattern checks.
 *
 * That is enough to say "you under-ran Task 2 by 90 words"; it is NOT enough
 * to judge lexical range or pronunciation, and those criteria say so instead
 * of guessing. `confidence` reports how much of the result is measured.
 *
 * To switch to the real examiner: implement `RemoteAnalyzer` against
 * SPEAKING_EXAMINER_PROMPT / WRITING_EXAMINER_PROMPT in examinerPrompts.ts —
 * both return exactly these types, so nothing downstream changes.
 */

export const ANALYSIS_SOURCE = 'heuristic' as const;

/** Bands are reported in half-steps, as IELTS does. */
function toHalfBand(value: number): number {
  return Math.max(3, Math.min(9, Math.round(value * 2) / 2));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/* ------------------------------------------------------------------ *
 * Speaking
 * ------------------------------------------------------------------ */

/** Rough target seconds per answer, by part. */
const SPEAKING_TARGETS: Record<number, number> = { 1: 25, 2: 105, 3: 40 };

const UNMEASURED = (criterion: string): string[] => [
  `Not measured in this build — ${criterion} needs the examiner model.`,
];

export function analyzeSpeaking(answers: SpeakingAnswer[]): SpeakingAnalysis {
  const byPart = (part: number) => answers.filter((a) => a.part === part);

  const partRatio = (part: number) => {
    const items = byPart(part);
    if (items.length === 0) return 0;
    const target = SPEAKING_TARGETS[part] ?? 30;
    return average(items.map((a) => Math.min(1.4, a.durationMs / 1000 / target)));
  };

  const ratios = [partRatio(1), partRatio(2), partRatio(3)].filter((r) => r > 0);
  const coverage = answers.length / 19; // 18 questions + the long turn
  const anyRecorded = answers.some((a) => a.recorded);

  // Fluency is the only criterion the client can genuinely evidence.
  const fluencyBand = toHalfBand(4.5 + average(ratios) * 2.2 * Math.min(1, coverage + 0.15));

  const shortAnswers = answers.filter(
    (a) => a.durationMs / 1000 < (SPEAKING_TARGETS[a.part] ?? 30) * 0.55,
  );

  const fluency: CriterionAnalysis = {
    band: fluencyBand,
    evidence: [
      `Answered ${answers.length} of 19 prompts.`,
      `Average Part 1 answer ${Math.round(average(byPart(1).map((a) => a.durationMs / 1000)))}s (target ~${SPEAKING_TARGETS[1]}s).`,
      `Long turn ${Math.round(average(byPart(2).map((a) => a.durationMs / 1000)))}s of a possible 120s.`,
    ],
    strengths:
      shortAnswers.length <= 3
        ? ['Sustained answers of a reasonable length across most prompts.']
        : [],
    limitations:
      shortAnswers.length > 3
        ? [`${shortAnswers.length} answers ended well short of the expected length.`]
        : [],
    next_priority:
      shortAnswers.length > 3
        ? 'Extend each answer with one reason and one example before stopping.'
        : 'Keep answers running without long pauses when the topic is unfamiliar.',
  };

  const unmeasured = (label: string, priority: string): CriterionAnalysis => ({
    band: fluencyBand,
    evidence: UNMEASURED(label),
    strengths: [],
    limitations: [`No transcript is produced in this build, so ${label} is not assessed.`],
    next_priority: priority,
  });

  const criteria = {
    fluency_and_coherence: fluency,
    lexical_resource: unmeasured(
      'lexical resource',
      'Build topic vocabulary for the Part 3 discussion themes.',
    ),
    grammatical_range_and_accuracy: unmeasured(
      'grammatical range',
      'Practise complex sentences with subordinate clauses.',
    ),
    pronunciation: unmeasured(
      'pronunciation',
      'Record yourself and check word stress on longer words.',
    ),
  };

  const overall = toHalfBand(
    average(Object.values(criteria).map((criterion) => criterion.band)),
  );

  const priorities: string[] = [];
  if (shortAnswers.length > 3) priorities.push('Extend short answers with reasons and examples');
  if (partRatio(2) < 0.6) priorities.push('Fill the full two minutes in the Part 2 long turn');
  if (!anyRecorded) priorities.push('Check your microphone before the next Speaking task');
  priorities.push('Reduce long pauses when changing topic');

  return {
    test_type: 'IELTS Speaking',
    overall_band: overall,
    criteria,
    part_analysis: {
      part_1: `${byPart(1).length} of 12 prompts answered, averaging ${Math.round(average(byPart(1).map((a) => a.durationMs / 1000)))}s.`,
      part_2: byPart(2).length
        ? `Long turn ran ${Math.round(average(byPart(2).map((a) => a.durationMs / 1000)))}s of 120s.`
        : 'Long turn not attempted.',
      part_3: `${byPart(3).length} of 6 discussion prompts answered, averaging ${Math.round(average(byPart(3).map((a) => a.durationMs / 1000)))}s.`,
    },
    top_3_priorities: priorities.slice(0, 3),
    learning_profile_note: `Estimated from timing only. Spoke across ${answers.length} prompts; fluency indicators ${
      shortAnswers.length > 3 ? 'below' : 'around'
    } target length.`,
    // Only one of four criteria is genuinely measured.
    confidence: anyRecorded ? 0.25 : 0.15,
  };
}

/* ------------------------------------------------------------------ *
 * Writing
 * ------------------------------------------------------------------ */

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Literal, checkable patterns — no grammar model involved. */
const ERROR_PATTERNS: {
  id: string;
  category: string;
  explanation: string;
  find: RegExp;
  fix: (match: string) => string;
}[] = [
  {
    id: 'i-lowercase',
    category: 'Capitalisation',
    explanation: 'The pronoun “I” is always capitalised.',
    find: /\bi\b(?=\s)/g,
    fix: () => 'I',
  },
  {
    id: 'there-is-plural',
    category: 'Subject-verb agreement',
    explanation: 'Use “there are” with a plural noun.',
    find: /\bthere is (?=\w+s\b)/gi,
    fix: () => 'there are ',
  },
  {
    id: 'people-is',
    category: 'Subject-verb agreement',
    explanation: '“People” is plural, so it takes “are”.',
    find: /\bpeople is\b/gi,
    fix: () => 'people are',
  },
  {
    id: 'double-space',
    category: 'Spacing',
    explanation: 'Use a single space between sentences.',
    find: / {2,}/g,
    fix: () => ' ',
  },
  {
    id: 'informal-contraction',
    category: 'Register',
    explanation: 'Avoid contractions in academic writing — write the full form.',
    find: /\b(don't|can't|won't|isn't|it's)\b/gi,
    fix: (m) =>
      ({ "don't": 'do not', "can't": 'cannot', "won't": 'will not', "isn't": 'is not', "it's": 'it is' })[
        m.toLowerCase()
      ] ?? m,
  },
];

function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function findErrors(text: string): ImportantError[] {
  const errors: ImportantError[] = [];

  for (const sentence of sentencesOf(text)) {
    for (const pattern of ERROR_PATTERNS) {
      pattern.find.lastIndex = 0;
      const match = pattern.find.exec(sentence);
      if (!match) continue;

      pattern.find.lastIndex = 0;
      errors.push({
        original: sentence,
        correction: sentence.replace(pattern.find, (m) => pattern.fix(m)),
        category: pattern.category,
        explanation: pattern.explanation,
      });
      break; // one finding per sentence keeps the review readable
    }
    if (errors.length >= 8) break;
  }

  return errors;
}

function analyzeWritingTask(
  response: WritingResponse | undefined,
  minWords: number,
): WritingTaskAnalysis {
  const text = response?.text ?? '';
  const words = countWords(text);
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0).length;
  const sentences = sentencesOf(text);
  const avgSentence = sentences.length ? words / sentences.length : 0;

  const lengthRatio = minWords === 0 ? 0 : Math.min(1.25, words / minWords);
  const achievementBand = toHalfBand(words === 0 ? 3 : 3.5 + lengthRatio * 2.8);
  const cohesionBand = toHalfBand(
    words === 0 ? 3 : 4 + Math.min(1.6, paragraphs * 0.5) + (avgSentence > 8 ? 0.6 : 0),
  );
  const errors = findErrors(text);

  const lexicalBand = toHalfBand(words === 0 ? 3 : 4.5 + lengthRatio * 1.2);
  const grammarBand = toHalfBand(
    words === 0 ? 3 : 6 - Math.min(2, errors.length * 0.4),
  );

  return {
    criteria: {
      task_achievement: {
        band: achievementBand,
        evidence: [`${words} words against a ${minWords}-word minimum.`],
        strengths: words >= minWords ? ['Met the required length.'] : [],
        limitations:
          words < minWords
            ? [`Under length by ${minWords - words} words, which caps this criterion.`]
            : [],
        next_priority:
          words < minWords
            ? 'Reach the word minimum before refining style.'
            : 'Make sure every part of the prompt is addressed.',
      },
      coherence_and_cohesion: {
        band: cohesionBand,
        evidence: [
          `${paragraphs} paragraph${paragraphs === 1 ? '' : 's'}, ${sentences.length} sentences.`,
          `Average sentence length ${avgSentence.toFixed(1)} words.`,
        ],
        strengths: paragraphs >= 3 ? ['Clear paragraph separation.'] : [],
        limitations: paragraphs < 3 ? ['Too few paragraphs for a clear structure.'] : [],
        next_priority:
          paragraphs < 3
            ? 'Plan an introduction, body paragraphs and a conclusion.'
            : 'Vary linking so paragraphs connect explicitly.',
      },
      lexical_resource: {
        band: lexicalBand,
        evidence: UNMEASURED('lexical range'),
        strengths: [],
        limitations: ['Vocabulary range needs the examiner model to judge.'],
        next_priority: 'Build topic-specific vocabulary and avoid repeating key nouns.',
      },
      grammatical_range_and_accuracy: {
        band: grammarBand,
        evidence: [
          errors.length
            ? `${errors.length} checkable issue${errors.length === 1 ? '' : 's'} found by pattern matching.`
            : 'No issues found by the pattern checks.',
        ],
        strengths: errors.length === 0 ? ['No mechanical errors detected.'] : [],
        limitations: errors.map((error) => `${error.category}: ${error.explanation}`).slice(0, 3),
        next_priority: errors[0]
          ? `Review ${errors[0].category.toLowerCase()}.`
          : 'Extend the range of sentence structures you use.',
      },
    },
    important_errors: errors,
  };
}

export function analyzeWriting(responses: WritingResponse[]): WritingAnalysis {
  const find = (id: string) => responses.find((r) => r.taskId === id);
  const task1Min = WRITING_TASKS[0]?.minWords ?? 150;
  const task2Min = WRITING_TASKS[1]?.minWords ?? 250;

  const task1 = analyzeWritingTask(find('task-1'), task1Min);
  const task2 = analyzeWritingTask(find('task-2'), task2Min);

  const bandsOf = (task: WritingTaskAnalysis) =>
    Object.values(task.criteria).map((criterion) => criterion.band);

  // Task 2 carries double weight, as in the real mark scheme.
  const overall = toHalfBand(
    (average(bandsOf(task1)) + average(bandsOf(task2)) * 2) / 3,
  );

  const allErrors = [...task1.important_errors, ...task2.important_errors];
  const tagCounts = new Map<string, number>();
  allErrors.forEach((error) =>
    tagCounts.set(error.category, (tagCounts.get(error.category) ?? 0) + 1),
  );

  const priorities: string[] = [];
  const words1 = countWords(find('task-1')?.text ?? '');
  const words2 = countWords(find('task-2')?.text ?? '');
  if (words1 < task1Min) priorities.push(`Reach 150 words on Task 1 (wrote ${words1})`);
  if (words2 < task2Min) priorities.push(`Reach 250 words on Task 2 (wrote ${words2})`);
  [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => priorities.push(`${tag} — ${count} occurrence${count === 1 ? '' : 's'}`));
  priorities.push('Plan for two minutes before writing each task');

  return {
    test_type: 'IELTS Writing',
    overall_band: overall,
    task_1: task1,
    task_2: task2,
    top_3_priorities: priorities.slice(0, 3),
    learning_profile_note: `Task 1 ${words1} words, Task 2 ${words2} words. ${
      allErrors.length
    } checkable issue${allErrors.length === 1 ? '' : 's'} found.`,
    confidence: 0.35,
  };
}

/* ------------------------------------------------------------------ *
 * Aggregation → AI Learning Profile Note
 * ------------------------------------------------------------------ */

const SPEAKING_LABELS: Record<string, string> = {
  fluency_and_coherence: 'Fluency & Coherence',
  lexical_resource: 'Lexical Resource',
  grammatical_range_and_accuracy: 'Grammatical Range & Accuracy',
  pronunciation: 'Pronunciation',
};

const WRITING_LABELS: Record<string, string> = {
  task_achievement: 'Task Achievement / Response',
  coherence_and_cohesion: 'Coherence & Cohesion',
  lexical_resource: 'Lexical Resource',
  grammatical_range_and_accuracy: 'Grammatical Range & Accuracy',
};

/** Folds both mocks into the note that drives the adaptive engine. */
export function buildLearningProfileNote(
  speaking: SpeakingAnalysis | null,
  writing: WritingAnalysis | null,
): LearningProfileNote {
  const weakest: LearningProfileNote['weakestSubSkills'] = [];

  if (speaking) {
    Object.entries(speaking.criteria).forEach(([id, criterion]) => {
      weakest.push({
        id: `speaking.${id}`,
        label: SPEAKING_LABELS[id] ?? id,
        band: criterion.band,
        skill: 'speaking',
      });
    });
  }

  if (writing) {
    // Average each criterion across both tasks.
    Object.keys(writing.task_2.criteria).forEach((key) => {
      const id = key as keyof typeof writing.task_2.criteria;
      const band = (writing.task_1.criteria[id].band + writing.task_2.criteria[id].band) / 2;
      weakest.push({
        id: `writing.${key}`,
        label: WRITING_LABELS[key] ?? key,
        band: Math.round(band * 2) / 2,
        skill: 'writing',
      });
    });
  }

  weakest.sort((a, b) => a.band - b.band);

  const tags = new Set<string>();
  if (writing) {
    [...writing.task_1.important_errors, ...writing.task_2.important_errors].forEach((error) =>
      tags.add(error.category),
    );
  }

  const priorities = [
    ...(speaking?.top_3_priorities ?? []),
    ...(writing?.top_3_priorities ?? []),
  ].slice(0, 5);

  const bands = [speaking?.overall_band, writing?.overall_band].filter(
    (band): band is number => typeof band === 'number',
  );

  const parts = [
    speaking ? speaking.learning_profile_note : null,
    writing ? writing.learning_profile_note : null,
  ].filter(Boolean);

  return {
    generatedAt: new Date().toISOString(),
    overallBand: bands.length ? toHalfBand(average(bands)) : null,
    speakingBand: speaking?.overall_band ?? null,
    writingBand: writing?.overall_band ?? null,
    weakestSubSkills: weakest.slice(0, 4),
    recurringErrorTags: [...tags],
    priorities,
    note: parts.join(' '),
  };
}
