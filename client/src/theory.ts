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

export const oopPillars = [
  {
    id: "oop-encapsulation-deep",
    title: "Đóng gói",
    english: "Encapsulation",
    question: "Ai được thay đổi state, và quy tắc nào phải luôn đúng?",
    summary:
      "Bảo vệ cách dữ liệu được tạo và thay đổi qua những hành vi có ý nghĩa.",
    junior: [
      "Private, property và constructor khác trách nhiệm gì?",
      "Vì sao public setter có thể phá invariant?",
      "Theo dấu thao tác bị từ chối và state sau lỗi.",
    ],
    middle: [
      "Ownership, read-only view và snapshot khác nhau ra sao?",
      "Giữ nhất quán khi một thao tác thất bại.",
      "Nhận ra giới hạn với concurrency và persistence.",
    ],
    orderCase: "Order chỉ cho thêm dòng khi Draft, từ chối xác nhận đơn rỗng.",
    misconception: "Có private field là đã giữ được mọi quy tắc.",
  },
  {
    id: "oop-abstraction-deep",
    title: "Trừu tượng",
    english: "Abstraction",
    question: "Caller cần biết điều gì, và được tin vào cam kết nào?",
    summary:
      "Chọn mô hình và hợp đồng phù hợp, giảm những chi tiết caller phải biết.",
    junior: [
      "Trừu tượng khác đóng gói ở câu hỏi nào?",
      "Interface, abstract class và hàm phù hợp khi nào?",
      "Theo dấu consumer được cung cấp implementation.",
    ],
    middle: [
      "Thiết kế contract theo nhu cầu, tránh lộ vendor type.",
      "Mô tả input, output, lỗi và tác dụng phụ.",
      "Chia capability có lý do; phân biệt fake và tích hợp thật.",
    ],
    orderCase:
      "Checkout dùng hợp đồng thanh toán, không tự hiểu mã lỗi riêng của SDK.",
    misconception: "Thêm interface cho mọi class là tự giảm coupling.",
  },
  {
    id: "oop-inheritance-deep",
    title: "Kế thừa",
    english: "Inheritance",
    question: "Lớp con có giữ những cam kết của lớp cha không?",
    summary:
      "Đi từ quan hệ is-a tới khả năng thay thế về hành vi, thay vì chỉ tái sử dụng code.",
    junior: [
      "Đọc constructor chain và quyền truy cập base/derived.",
      "Virtual, abstract và sealed mở/chặn điều gì?",
      "Vì sao không gọi method overridable trong constructor?",
    ],
    middle: [
      "Kiểm tra LSP bằng precondition, postcondition và invariant.",
      "Giải thích xung đột API mutable Rectangle/Square.",
      "Chọn composition khi có nhiều trục thay đổi độc lập.",
    ],
    orderCase:
      "Loại đơn dẫn xuất phải giữ mọi thao tác mà contract đơn gốc hứa hỗ trợ.",
    misconception: "Đúng is-a về tên gọi thì mọi hành vi đều thay thế được.",
  },
  {
    id: "oop-polymorphism-deep",
    title: "Đa hình",
    english: "Polymorphism",
    question: "Cùng hợp đồng, implementation nào được gọi và vì sao?",
    summary:
      "Dùng nhiều cách thực hiện qua một contract; tách lựa chọn overload khỏi runtime dispatch.",
    junior: [
      "Phân biệt kiểu tĩnh với kiểu runtime.",
      "Theo dấu overload, override và new/hiding.",
      "Gọi implementation qua interface mà không cast theo tên class.",
    ],
    middle: [
      "Giữ consumer ổn định và kiểm tra contract chung.",
      "Hiểu boxing/copy khi struct đi qua interface.",
      "Cân nhắc strategy, delegate, pattern matching và chi phí thực tế.",
    ],
    orderCase:
      "Checkout gọi một policy giá; từng implementation giữ cùng quy tắc đầu vào/kết quả.",
    misconception: "Runtime luôn chọn overload cụ thể nhất của mọi đối số.",
  },
];
export const isOopLesson = (lesson: Pick<Lesson, "id">) =>
  oopPillars.some((p) => p.id === lesson.id);

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
      "oop-encapsulation-deep",
      "oop-abstraction-deep",
      "oop-inheritance-deep",
      "oop-polymorphism-deep",
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
export type ReadOrder =
  | "lecture"
  | "topic"
  | "foundation"
  | "interview"
  | "oop";
export const orderLabels: Record<ReadOrder, string> = {
  lecture: "Thứ tự phần bài giảng",
  topic: "Theo chủ đề",
  foundation: "Lộ trình học nền tảng",
  interview: "Lộ trình ôn phỏng vấn",
  oop: "Chuyên đề 4 tính chất OOP",
};
export function orderedLessons(l: Lesson, order: ReadOrder) {
  if (order === "oop") return oopPillars.map((p) => byId.get(p.id)!);
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
