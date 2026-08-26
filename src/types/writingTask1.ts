/** Types for the Academic Writing Task 1 question bank. */

/**
 * The visual form the candidate has to describe. IELTS Academic Task 1 always
 * presents one of these; the category drives which describing language the
 * adaptive engine should coach.
 */
export type Task1Category =
  | 'bar_chart'
  | 'line_graph'
  | 'pie_chart'
  | 'table'
  | 'map'
  | 'process_diagram'
  | 'diagram'
  | 'flow_chart'
  | 'mixed_chart';

/** The Task 1 sub-skills a question exercises. */
export type Task1Skill =
  | 'OVERVIEW_WRITING'
  | 'TREND_DESCRIPTION'
  | 'DATA_COMPARISON'
  | 'DATA_SELECTION'
  | 'PROCESS_DESCRIPTION'
  | 'SPATIAL_DESCRIPTION'
  | 'STAGE_DESCRIPTION'
  | 'CHANGE_ANALYSIS'
  | 'MULTIPLE_DATA_SYNTHESIS';

export type Task1Domain =
  | 'EDUCATION'
  | 'TRANSPORT'
  | 'ENVIRONMENT'
  | 'TECHNOLOGY'
  | 'HEALTH'
  | 'ECONOMY'
  | 'POPULATION'
  | 'ENERGY'
  | 'TOURISM'
  | 'WORK'
  | 'CITIES'
  | 'SCIENCE'
  | 'AGRICULTURE'
  | 'OTHER';

export type Task1Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

/**
 * Duplicates are kept, never deleted — two questions can legitimately repeat
 * in a compilation, and the relationship is worth knowing when scheduling.
 */
export type Task1DuplicateStatus = 'UNIQUE' | 'EXACT_DUPLICATE' | 'NEAR_DUPLICATE';

export interface WritingTask1Question {
  /** Stable id, `WT1_001`…`WT1_053`. */
  id: string;
  /** Id this record had before the bank was renumbered, where one existed. */
  legacyId?: string;
  /** Short human label for lists and tabs, e.g. `Task 7`. */
  label: string;
  /** Descriptive title of the visual, used as a heading and for search. */
  title: string;
  category: Task1Category;
  /**
   * The instruction block exactly as it appears in the source, with no
   * surrounding rubric. Kept separate so the wording can be verified against
   * the original — including the source's own typos, which are preserved.
   */
  stimulus: string;
  /**
   * The rubric as a candidate sees it on screen: timing line, the stimulus,
   * and the word minimum. Composed from `stimulus`; nothing is invented.
   */
  prompt: string;
  /** Public-path reference to the diagram bitmap. */
  imagePath: string;
  /** Natural pixel size of `imagePath`, so the pane can reserve space. */
  imageWidth: number;
  imageHeight: number;
  /** Alt text describing what the visual shows. */
  imageAlt: string;
  minutesGuide: number;
  minWords: number;
  difficulty: Task1Difficulty;
  /** Uppercase form of `category`, as stored in the master content database. */
  visualType: string;
  skills: Task1Skill[];
  domains: Task1Domain[];
  duplicateStatus: Task1DuplicateStatus;
  /** Ids this question duplicates or closely resembles. */
  relatedTaskIds: string[];
  /** Page of the source document this came from. */
  sourcePage: number;
  /** Where this question came from, for attribution. */
  source: string;
  /** Why a borderline classification went the way it did. */
  classificationNote?: string;
}
