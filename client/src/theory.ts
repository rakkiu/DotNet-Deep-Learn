import data from "./data/theory.json";
import articles from "./data/articles";
export interface Definition {
  term: string;
  meaning: string;
  example: string;
}
export interface RequestCase {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
  status: number;
  notes?: string;
}
export interface Example {
  id: string;
  title: string;
  kind: string;
  label: string;
  input: string;
  shell: string;
  setup: string;
  files: Record<string, string>;
  expected: string;
  explanation: string;
  verification: string;
  project?: string;
  requests?: RequestCase[];
  diagnostic?: string;
  entryProject?: string;
}
export interface Question {
  id: string;
  level: "junior" | "middle";
  prompt: string;
  answer: string;
  explanation: string;
  misconception: string;
  followUp: string;
}
export interface Section {
  id: string;
  title: string;
  group: string;
  paragraphs?: string[];
  definitions?: Definition[];
  tables?: { caption: string; headers: string[]; rows: string[][] }[];
  diagrams?: { caption: string; steps: string[] }[];
  examples?: Example[];
  questions?: Question[];
  relatedGuide?: boolean;
  links?: { title: string; url: string }[];
  community?: string;
}
export interface VersionContext {
  reviewedAt: string;
  sdk: string;
  framework: string;
  language: string;
  runtime: string;
  efCore: string;
  xunit: string;
  testSdk: string;
  xunitRunner: string;
}
export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  kind: string;
  sourceParts: number[];
  origin: "lecture" | "extension";
  auditCode: string;
  prerequisites: string[];
  prerequisiteIds: string[];
  relatedIds: string[];
  goals: string[];
  reviewedAt: string;
  version: VersionContext;
  sections: Section[];
  minutes: number;
}
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
export const examplesOf = (l: Pick<Lesson, "sections">) =>
  l.sections.flatMap((s) => s.examples ?? []);
export const questionsOf = (l: Pick<Lesson, "sections">) =>
  l.sections.flatMap((s) => s.questions ?? []);
function prose(s: Section) {
  return [
    s.title,
    ...(s.paragraphs ?? []),
    ...(s.definitions?.flatMap((d) => [d.term, d.meaning, d.example]) ?? []),
    ...(s.tables?.flatMap((t) => [t.caption, ...t.headers, ...t.rows.flat()]) ??
      []),
    ...(s.diagrams?.flatMap((d) => [d.caption, ...d.steps]) ?? []),
    ...(s.examples?.flatMap((e) => [
      e.title,
      e.input,
      e.expected,
      e.explanation,
    ]) ?? []),
    ...(s.questions?.flatMap((q) => [
      q.prompt,
      q.answer,
      q.explanation,
      q.misconception,
      q.followUp,
    ]) ?? []),
  ].join(" ");
}
/** Estimate = whitespace-separated prose units / 230 + nonempty code/command lines / 18.
 * Includes examples and answers once; rounded up. This is a reading estimate, not a skill score. */
export function readingMinutes(l: Pick<Lesson, "sections">) {
  const words = l.sections.map(prose).join(" ").trim().split(/\s+/).length;
  const lines = examplesOf(l)
    .flatMap((e) => [e.setup, ...Object.values(e.files ?? {})])
    .join("\n")
    .split("\n")
    .filter((s) => s.trim()).length;
  return Math.max(1, Math.ceil(words / 230 + lines / 18));
}
const lessons = (articles as unknown as Lesson[]).map((l) => ({
  ...l,
  minutes: readingMinutes(l),
}));
export const curriculum = { ...data, lessons };
export const byId = new Map(lessons.map((l) => [l.id, l]));
export const sectionText = (s: Section) =>
  [
    prose(s),
    ...(s.examples?.flatMap((e) => [
      e.setup,
      ...Object.values(e.files ?? {}),
      JSON.stringify(e.requests ?? []),
    ]) ?? []),
  ].join(" ");
const index = new Map(
  lessons.map((l) => [
    l.id,
    normalize(
      [
        l.title,
        l.description,
        l.kind,
        l.auditCode,
        ...l.sections.map(sectionText),
      ].join(" "),
    ),
  ]),
);
export function searchLessons(query: string, category = "", origin = "") {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return lessons.filter(
    (l) =>
      (!category || l.category === category) &&
      (!origin || l.origin === origin) &&
      words.every((w) => index.get(l.id)!.includes(w)),
  );
}
export function matchSnippet(l: Lesson, q: string) {
  const words = normalize(q).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return l.description;
  const p = l.sections
    .flatMap((s) => [
      ...(s.paragraphs ?? []),
      ...(s.questions?.map((q) => q.explanation) ?? []),
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
export const pathModules = [
  {
    id: "start",
    title: "Ngôn ngữ và dữ liệu",
    outcome: "Giải thích alias/null/copy và chọn cấu trúc dữ liệu.",
    ids: [
      "dotnet-first-program",
      "visual-studio",
      "csharp-language",
      "csharp-types",
      "csharp-control-flow",
      "csharp-methods",
      "csharp-arrays",
      "csharp-collections",
      "csharp-exceptions",
      "dotnet-streams",
      "csharp-lambda",
      "linq-basics",
      "oop-classes",
      "csharp-value-modeling",
      "csharp-strings-unicode",
      "dotnet-dates-numbers-culture",
      "dotnet-memory-gc",
    ],
  },
  {
    id: "design",
    title: "Hợp đồng và thiết kế",
    outcome: "Thay implementation, giữ invariant và kiểm tra rule bằng test.",
    ids: [
      "oop-polymorphism",
      "csharp-static",
      "oop-interfaces",
      "design-testing-patterns",
      "unit-testing",
      "factory-pattern",
      "decorator-pattern",
      "csharp-generics",
      "csharp-events",
      "dependency-injection",
      "dotnet-reflection",
    ],
  },
  {
    id: "async",
    title: "Chờ, chạy và phối hợp",
    outcome: "Giữ owner cho task, trả permit và giải thích lỗi/hủy.",
    ids: [
      "tasks-concurrency",
      "dotnet-threads",
      "thread-signals",
      "semaphore-limits",
      "thread-lock",
      "async-await",
      "task-composition",
      "dotnet-background-workers",
    ],
  },
  {
    id: "http",
    title: "Mạng và giao thức",
    outcome:
      "Đọc framing/status, stream body và dùng HttpClient đúng lifetime.",
    ids: [
      "tcp-sockets",
      "http-request-line",
      "http-headers",
      "http-response",
      "httpclient-json",
    ],
  },
  {
    id: "web",
    title: "Web và bảo mật",
    outcome:
      "Theo dấu request, tạo API/form đúng status và kiểm tra quyền owner.",
    ids: [
      "aspnet-first-app",
      "mvc-views",
      "mvc-routing",
      "mvc-binding",
      "aspnet-middleware",
      "aspnet-web-api-design",
      "aspnet-configuration-observability",
      "aspnet-authorization",
      "aspnet-identity-api-security",
    ],
  },
  {
    id: "data",
    title: "Database và vận hành",
    outcome: "Đọc SQL, xử lý conflict, review migration và smoke test publish.",
    ids: [
      "relational-databases",
      "efcore-context",
      "efcore-migrations",
      "efcore-relationships",
      "memory-caching",
      "efcore-transactions-concurrency",
      "efcore-query-performance",
      "aspnet-integration-testing",
      "dotnet-delivery-basics",
    ],
  },
];
export type ReadOrder = "lecture" | "topic" | "foundation" | "interview";
export const orderLabels: Record<ReadOrder, string> = {
  lecture: "Thứ tự phần bài giảng",
  topic: "Theo chủ đề",
  foundation: "Lộ trình học nền tảng",
  interview: "Lộ trình ôn phỏng vấn",
};
export function orderedLessons(l: Lesson, order: ReadOrder) {
  if (order === "lecture") return lessons.filter((x) => x.origin === "lecture");
  if (order === "topic")
    return lessons.filter((x) => x.category === l.category);
  const modules =
    order === "interview"
      ? [
          pathModules[1],
          pathModules[4],
          pathModules[5],
          pathModules[2],
          pathModules[3],
          pathModules[0],
        ]
      : pathModules;
  return modules.flatMap((m) => m.ids.map((id) => byId.get(id)!));
}
