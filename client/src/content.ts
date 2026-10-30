import raw from "./data/catalog.json";
import type {
  Catalog,
  Example,
  Feedback,
  Lesson,
  Option,
  Question,
} from "./types";
export interface FullQuestion extends Question {
  correctOptionId: string;
  explanation: string;
  options: Required<Option>[];
}
export interface Prediction {
  correct: boolean;
  output: string;
  steps: string[];
  comparison: string;
  table?: { headers: string[]; rows: string[][] };
}
interface FullExample extends Example {
  correctOptionId: string;
  output: string;
  steps: string[];
  comparison: string;
  table?: Prediction["table"] | null;
}
interface FullLesson extends Omit<Lesson, "questions" | "examples"> {
  questions: FullQuestion[];
  examples: FullExample[];
}
// Answer keys are bundled on the client. Hiding them in the UI is a learning flow, not an anti-cheating boundary.
export const content = raw as {
  topics: Catalog["topics"];
  lessons: FullLesson[];
};
export const catalog: Catalog = {
  topics: [...content.topics].sort(
    (a, b) =>
      ("order" in a ? Number(a.order) : 0) -
      ("order" in b ? Number(b.order) : 0),
  ),
  lessons: content.lessons
    .map((l) => ({
      ...l,
      questions: l.questions.map(
        ({ correctOptionId: _, explanation: __, options, ...q }) => ({
          ...q,
          options: options.map(({ explanation: _, ...o }) => o),
        }),
      ),
      examples: l.examples.map(
        ({
          correctOptionId: _,
          output: __,
          steps: ___,
          comparison: ____,
          table: _____,
          ...e
        }) => e,
      ),
    }))
    .sort((a, b) => a.order - b.order),
};
export function findLesson(id: string) {
  const l = content.lessons.find((l) => l.id === id);
  if (!l) throw new Error("Không tìm thấy bài học.");
  return l;
}
export function findQuestion(lessonId: string, questionId: string) {
  const q = findLesson(lessonId).questions.find((q) => q.id === questionId);
  if (!q) throw new Error("Không tìm thấy câu hỏi trong bài.");
  return q;
}
export function gradeQuestion(
  lessonId: string,
  questionId: string,
  optionId: string,
): Feedback {
  const q = findQuestion(lessonId, questionId);
  if (!q.options.some((o) => o.id === optionId))
    throw new Error("Lựa chọn không hợp lệ.");
  return {
    correct: q.correctOptionId === optionId,
    correctOptionId: q.correctOptionId,
    explanation: q.explanation,
    options: structuredClone(q.options),
  };
}
export function predictExample(
  lessonId: string,
  exampleId: string,
  optionId: string,
): Prediction {
  const e = findLesson(lessonId).examples.find((e) => e.id === exampleId);
  if (!e || !e.options.some((o) => o.id === optionId))
    throw new Error("Ví dụ hoặc lựa chọn không hợp lệ.");
  return {
    correct: e.correctOptionId === optionId,
    output: e.output,
    steps: [...e.steps],
    comparison: e.comparison,
    table: e.table ? structuredClone(e.table) : undefined,
  };
}
