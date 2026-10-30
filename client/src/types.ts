export type SectionKey = "explain" | "examples" | "quiz" | "exercises";
export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
}
export interface Option {
  id: string;
  text: string;
  explanation?: string;
}
export interface Question {
  id: string;
  kind: string;
  prompt: string;
  options: Option[];
  tag: string;
  misconception: string;
  sectionId: string;
}
export interface Example {
  id: string;
  title: string;
  prompt: string;
  code: string;
  options: Option[];
  language: string;
}
export interface Exercise {
  id: string;
  level: string;
  title: string;
  prompt: string;
  input: string;
  expected: string;
  starter: string;
  hints: string[];
  solution: string;
  explanation: string;
  checklist: string[];
  alternative: string;
}
export interface Lesson {
  id: string;
  topicId: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  tags: string[];
  level: string;
  minutes: number;
  prerequisites: string[];
  language: string;
  version: string;
  schema?: string;
  sections: { id: string; title: string; core: string; deep: string }[];
  examples: Example[];
  questions: Question[];
  exercises: Exercise[];
  sources: { title: string; url: string }[];
}
export interface Progress {
  lessonId: string;
  section: SectionKey;
  read: boolean;
  updatedAt: string;
}
export interface Feedback {
  correct: boolean;
  correctOptionId: string;
  explanation: string;
  options: Option[];
}
export interface Attempt {
  id: number;
  lessonId: string;
  questionId: string;
  optionId: string;
  correct: boolean;
  feedback: string;
  createdAt: string;
}
export interface Submission {
  id: string;
  lessonId: string;
  exerciseId: string;
  code: string;
  checks: string;
  assessed: boolean;
  updatedAt: string;
}
export interface State {
  progress: Progress[];
  notes: { lessonId: string; text: string }[];
  bookmarks: { lessonId: string }[];
  submissions: Submission[];
  attempts: Attempt[];
}
export interface Catalog {
  topics: Topic[];
  lessons: Lesson[];
}
export const latestAttempts = (attempts: Attempt[]) =>
  Object.values(
    attempts.reduce<Record<string, Attempt>>((a, x) => {
      if (!a[x.questionId] || a[x.questionId].id < x.id) a[x.questionId] = x;
      return a;
    }, {}),
  );
export const pendingReview = (attempts: Attempt[]) =>
  latestAttempts(attempts).filter((a) => !a.correct);
export function metrics(lesson: Lesson, state: State) {
  const progress = state.progress.find((p) => p.lessonId === lesson.id);
  const correct = latestAttempts(state.attempts).filter(
    (a) => a.lessonId === lesson.id && a.correct,
  ).length;
  const assessed = state.submissions.filter(
    (s) => s.lessonId === lesson.id && s.assessed,
  ).length;
  const units = Number(progress?.read ?? false) + correct + assessed;
  return {
    read: !!progress?.read,
    correct,
    assessed,
    percent: Math.round(
      (units / (1 + lesson.questions.length + lesson.exercises.length)) * 100,
    ),
    complete:
      !!progress?.read &&
      correct === lesson.questions.length &&
      assessed === lesson.exercises.length,
    started: !!progress,
  };
}
