/** Types for the Academic Writing Task 1 question bank. */

/**
 * The visual form the candidate has to describe. IELTS Academic Task 1 always
 * presents one of these; the category drives which describing language the
 * adaptive engine should coach.
 */
export type Task1Category =
  | 'bar_chart'
  | 'line_graph'
  | 'process_diagram'
  | 'pie_chart'
  | 'table'
  | 'map';

export interface WritingTask1Question {
  /** Stable slug, e.g. `task-1a`. */
  id: string;
  /** Short human label for lists and tabs, e.g. `Task 1A`. */
  label: string;
  /** Descriptive title of the visual, used as a heading and for search. */
  title: string;
  category: Task1Category;
  /**
   * The rubric exactly as a candidate sees it on screen: timing line, the
   * stimulus description, the "Summarise the information…" instruction, and
   * the word minimum.
   */
  prompt: string;
  /**
   * The stimulus sentence transcribed verbatim from the source paper, with no
   * surrounding rubric. Kept separate so the wording can be verified against
   * the original without the assembled rubric getting in the way.
   */
  stimulus: string;
  /** Public-path reference to the diagram bitmap. */
  imagePath: string;
  /** Natural pixel size of `imagePath`, so the pane can reserve space. */
  imageWidth: number;
  imageHeight: number;
  /** Alt text describing what the visual shows. */
  imageAlt: string;
  minutesGuide: number;
  minWords: number;
  /** Where this question came from, for attribution. */
  source: string;
}
