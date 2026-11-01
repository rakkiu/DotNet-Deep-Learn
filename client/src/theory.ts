import data from "./data/theory.json";
import articles from "./data/articles";
export interface Definition {
  term: string;
  meaning: string;
  example: string;
}
export interface Hello {
  setup: string;
  code: string;
  file: string;
  language: string;
  files: Record<string, string>;
  output: string;
  steps: string[];
  note: string;
  request?: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
  } | null;
}
export interface Section {
  id: string;
  title: string;
  group: string;
  paragraphs?: string[];
  definitions?: Definition[];
  hello?: Hello;
  structure?: { code: string; note: string };
  links?: { title: string; url: string }[];
  community?: string;
}
export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  kind: string;
  sourceParts: number[];
  prerequisites: string[];
  sections: Section[];
  minutes: number;
}
export const curriculum = { ...data, lessons: articles } as Omit<typeof data, "lessons"> & {
  lessons: Lesson[];
};
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
export const sectionText = (s: Section) =>
  [
    s.title,
    ...(s.paragraphs ?? []),
    ...(s.definitions?.flatMap((d) => [d.term, d.meaning, d.example]) ?? []),
    s.hello?.code,
    s.structure?.note,
  ]
    .filter(Boolean)
    .join(" ");
export function searchLessons(query: string, category = "") {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return curriculum.lessons.filter(
    (l) =>
      (!category || l.category === category) &&
      words.every((w) =>
        normalize(
          [l.title, l.description, l.kind, ...l.sections.map(sectionText)].join(
            " ",
          ),
        ).includes(w),
      ),
  );
}
export function matchSnippet(l: Lesson, q: string) {
  const words = normalize(q).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return l.description;
  const p = l.sections
    .flatMap((s) => [
      ...(s.paragraphs ?? []),
      ...(s.definitions?.flatMap((d) => [d.meaning, d.example]) ?? []),
    ])
    .find((p) => words.some((w) => normalize(p).includes(w)));
  if (!p) return l.description;
  const start = Math.max(
    0,
    Math.min(
      ...words.map((w) => normalize(p).indexOf(w)).filter((i) => i >= 0),
    ) - 55,
  );
  return (
    (start ? "…" : "") +
    p.slice(start, start + 210) +
    (p.length > start + 210 ? "…" : "")
  );
}
