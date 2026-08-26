import type { WritingTask1Question } from '../types/writingTask1';

/**
 * IELTS Academic Writing Task 1 question bank.
 *
 * Transcribed from the official `IELTS Academic Writing Sample Tasks` paper
 * (2023), pages 3–5. Only Task 1 is represented here: the Task 2 essay
 * prompts on pages 6–7 and the sample candidate scripts on pages 8–26 are
 * deliberately excluded, because this bank feeds the Task 1 module only.
 *
 * `stimulus` is the source sentence word-for-word. `prompt` wraps it in the
 * standard on-screen rubric — the timing and word-count lines come from the
 * paper's own front-matter ("They need to write 150 words in about 20
 * minutes"), phrased the way the computer-delivered test presents them.
 *
 * Images were extracted from the same PDF and are served from
 * `public/tasks/writing/`. They are the original figures, not redrawn.
 */

const SUMMARISE =
  'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.';

const SOURCE = 'IELTS Academic Writing Sample Tasks (2023), p.3–5';

function rubric(stimulus: string): string {
  return [
    'You should spend about 20 minutes on this task.',
    '',
    stimulus,
    '',
    SUMMARISE,
    '',
    'Write at least 150 words.',
  ].join('\n');
}

export const WRITING_TASK_1_QUESTIONS: WritingTask1Question[] = [
  {
    id: 'task-1a',
    label: 'Task 1A',
    title: 'Men and women in further education in Britain',
    category: 'bar_chart',
    stimulus:
      'The chart below shows the number of men and women in further education in Britain in three periods and whether they were studying full-time or part-time.',
    prompt: rubric(
      'The chart below shows the number of men and women in further education in Britain in three periods and whether they were studying full-time or part-time.',
    ),
    imagePath: '/tasks/writing/task-1a.png',
    imageWidth: 425,
    imageHeight: 424,
    imageAlt:
      'Grouped bar chart. Men and women in further education in Britain, in thousands, split into full-time and part-time education across 1970/71, 1980/81 and 1990/91. Male figures are on the left of a dashed divider, female figures on the right.',
    minutesGuide: 20,
    minWords: 150,
    source: SOURCE,
  },
  {
    id: 'task-1b',
    label: 'Task 1B',
    title: 'Radio and television audiences throughout the day',
    category: 'line_graph',
    stimulus:
      'The graph below shows radio and television audiences throughout the day in 1992.',
    prompt: rubric(
      'The graph below shows radio and television audiences throughout the day in 1992.',
    ),
    imagePath: '/tasks/writing/task-1b.png',
    imageWidth: 1011,
    imageHeight: 693,
    imageAlt:
      'Line graph titled “Radio and television audiences in UK, October – December 1992”. Two lines, television and radio, plot the percentage of the UK population over four years old against time of day from 6:00 through noon and midnight back to 6:00.',
    minutesGuide: 20,
    minWords: 150,
    source: SOURCE,
  },
  {
    id: 'task-1c',
    label: 'Task 1C',
    title: 'The process by which bricks are manufactured',
    category: 'process_diagram',
    stimulus:
      'The diagram below shows the process by which bricks are manufactured for the building industry.',
    prompt: rubric(
      'The diagram below shows the process by which bricks are manufactured for the building industry.',
    ),
    imagePath: '/tasks/writing/task-1c.png',
    imageWidth: 1096,
    imageHeight: 1000,
    imageAlt:
      'Process diagram titled “Brick Manufacturing”. Clay is dug by a digger, passed over a metal grid and roller, mixed with sand and water, then shaped by a wire cutter or a mould. The bricks go to a drying oven for 24–48 hours, then through kilns at 200–980°C and 870–1300°C, then a cooling chamber for 48–72 hours, before packaging and delivery. A footnote reads: “Clay: type of sticky earth that is used for making bricks, pots, etc.”',
    minutesGuide: 20,
    minWords: 150,
    source: SOURCE,
  },
];

export function findTask1Question(id: string): WritingTask1Question | undefined {
  return WRITING_TASK_1_QUESTIONS.find((question) => question.id === id);
}

/** Guide time for the whole Task 1 module, in milliseconds. */
export const TASK_1_TOTAL_MS = 20 * 60 * 1000;
