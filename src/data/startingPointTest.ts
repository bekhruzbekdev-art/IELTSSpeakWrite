import type { CueCard, SpeakingQuestion, WritingTask } from '../types/exam';

/**
 * Starting Point Test content.
 *
 * This is the diagnostic paper itself — supplied by the course author, not
 * generated. It is the one place real IELTS-style material lives.
 */

export const PART_1_QUESTIONS: SpeakingQuestion[] = [
  { id: 'p1-q1', part: 1, topic: 'Work / Studies', prompt: 'Do you work or are you a student?' },
  { id: 'p1-q2', part: 1, topic: 'Work / Studies', prompt: 'What do you enjoy most about your work or studies?' },
  { id: 'p1-q3', part: 1, topic: 'Work / Studies', prompt: 'Is there anything you would like to change about your work or studies?' },
  { id: 'p1-q4', part: 1, topic: 'Work / Studies', prompt: 'What would you like to do in the future?' },
  { id: 'p1-q5', part: 1, topic: 'Your Hometown', prompt: 'Where is your hometown?' },
  { id: 'p1-q6', part: 1, topic: 'Your Hometown', prompt: 'What do you like most about the place where you live?' },
  { id: 'p1-q7', part: 1, topic: 'Your Hometown', prompt: 'Has your hometown changed much in recent years?' },
  { id: 'p1-q8', part: 1, topic: 'Your Hometown', prompt: 'Would you like to live there in the future? Why or why not?' },
  { id: 'p1-q9', part: 1, topic: 'Free Time', prompt: 'What do you usually do in your free time?' },
  { id: 'p1-q10', part: 1, topic: 'Free Time', prompt: 'Do you prefer spending your free time alone or with other people?' },
  { id: 'p1-q11', part: 1, topic: 'Free Time', prompt: 'Did you have the same hobbies when you were a child?' },
  { id: 'p1-q12', part: 1, topic: 'Free Time', prompt: 'Is there a new activity you would like to try in the future?' },
];

export const PART_2_CUE_CARD: CueCard = {
  id: 'p2-cue',
  introduction:
    "Now I'm going to give you a topic and I'd like you to talk about it for one to two minutes. You have one minute to prepare what you're going to say. You can write down some notes if you wish.",
  title: 'Describe a person who has had an important influence on you.',
  bullets: [
    'who this person is',
    'how you know this person',
    'what this person has done to influence you',
  ],
  closing: "and explain why this person's influence has been important to you.",
  prepSeconds: 60,
  speakSeconds: 120,
};

export const PART_3_QUESTIONS: SpeakingQuestion[] = [
  { id: 'p3-q13', part: 3, topic: 'Influence & People', prompt: 'What kinds of people usually have the greatest influence on young people?' },
  { id: 'p3-q14', part: 3, topic: 'Influence & People', prompt: 'Do you think parents have more influence on children than teachers do? Why?' },
  { id: 'p3-q15', part: 3, topic: 'Influence & People', prompt: 'How has social media changed the way people influence each other?' },
  { id: 'p3-q16', part: 3, topic: 'Influence & People', prompt: 'Do you think young people today are more influenced by celebrities than previous generations were?' },
  { id: 'p3-q17', part: 3, topic: 'Influence & People', prompt: 'Is it always positive to be strongly influenced by another person?' },
  { id: 'p3-q18', part: 3, topic: 'Influence & People', prompt: 'What can people do to make sure they make their own decisions rather than simply following others?' },
];

/** Said after the Part 2 long turn ends. */
export const PART_2_CLOSING = "Thank you. That's enough.";

export const WRITING_TASKS: WritingTask[] = [
  {
    id: 'task-1',
    label: 'Task 1',
    minutesGuide: 20,
    minWords: 150,
    instructions:
      'You should spend about 20 minutes on this task. Write at least 150 words.',
    prompt:
      'The chart below shows the number of men and women in further education in Britain in three periods and whether they were studying full-time or part-time. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    chart: {
      title:
        'Men and women in further education in Britain, by study mode',
      yAxisLabel: 'Men and women in further education',
      unitNote: 'thousands',
      periods: ['1970/71', '1980/81', '1990/91'],
      max: 1200,
      groups: [
        {
          id: 'male',
          label: 'Male',
          series: [
            { id: 'full-time', label: 'Full-time education', values: [100, 150, 200] },
            { id: 'part-time', label: 'Part-time education', values: [1000, 870, 900] },
          ],
        },
        {
          id: 'female',
          label: 'Female',
          series: [
            { id: 'full-time', label: 'Full-time education', values: [50, 230, 260] },
            { id: 'part-time', label: 'Part-time education', values: [750, 820, 1100] },
          ],
        },
      ],
    },
  },
  {
    id: 'task-2',
    label: 'Task 2',
    minutesGuide: 40,
    minWords: 250,
    instructions:
      'You should spend about 40 minutes on this task. Write at least 250 words.',
    prompt:
      'Populations in developing nations are rapidly growing, and people now believe that we should turn to genetically modified crops to increase the production of food grains. Discuss the advantages and disadvantages of this approach.',
  },
];

/** Whole Speaking paper in the order the examiner runs it. */
export const SPEAKING_QUESTIONS: SpeakingQuestion[] = [
  ...PART_1_QUESTIONS,
  ...PART_3_QUESTIONS,
];

export const WRITING_TOTAL_MS = 60 * 60 * 1000;
