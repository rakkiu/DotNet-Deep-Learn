import { findLesson, findQuestion, gradeQuestion } from "./content";
import type { State } from "./types";
export const STORAGE_KEY = "dotnet-deep-learn:state:v1";
export const emptyState = (): State => ({
  progress: [],
  notes: [],
  bookmarks: [],
  submissions: [],
  attempts: [],
});
export type Backup = { version: 1; exportedAt: string; state: State };
const record = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const text = (x: unknown, max = 30000): x is string =>
  typeof x === "string" && x.length <= max;
const date = (x: unknown): x is string =>
  text(x, 100) && !Number.isNaN(Date.parse(x));
const fail = (): never => {
  throw new Error(
    "Dữ liệu lưu không hợp lệ hoặc thuộc phiên bản khác. Hãy kiểm tra tệp sao lưu; dữ liệu hiện tại chưa bị thay đổi.",
  );
};
export function validateState(input: unknown): State {
  if (!record(input)) return fail();
  const arrays = [
    "progress",
    "notes",
    "bookmarks",
    "submissions",
    "attempts",
  ] as const;
  if (arrays.some((k) => !Array.isArray(input[k]))) return fail();
  const state = structuredClone(input) as unknown as State;
  const unique = <T>(arr: T[], key: (x: T) => unknown) =>
    new Set(arr.map(key)).size === arr.length;
  try {
    for (const p of state.progress) {
      if (
        !record(p) ||
        !text(p.lessonId) ||
        !["explain", "examples", "quiz", "exercises"].includes(p.section) ||
        typeof p.read !== "boolean" ||
        !date(p.updatedAt)
      )
        return fail();
      findLesson(p.lessonId);
    }
    for (const n of state.notes) {
      if (!record(n) || !text(n.lessonId) || !text(n.text, 20000))
        return fail();
      findLesson(n.lessonId);
    }
    for (const b of state.bookmarks) {
      if (!record(b) || !text(b.lessonId)) return fail();
      findLesson(b.lessonId);
    }
    for (const s of state.submissions) {
      if (
        !record(s) ||
        !text(s.lessonId) ||
        !text(s.exerciseId) ||
        s.id !== s.lessonId + ":" + s.exerciseId ||
        !text(s.code) ||
        typeof s.assessed !== "boolean" ||
        !date(s.updatedAt) ||
        !text(s.checks, 1000)
      )
        return fail();
      const e = findLesson(s.lessonId).exercises.find(
          (e) => e.id === s.exerciseId,
        ),
        checks: unknown = JSON.parse(s.checks);
      if (
        !e ||
        !Array.isArray(checks) ||
        checks.length !== e.checklist.length ||
        checks.some((c) => typeof c !== "boolean") ||
        (s.assessed && (!s.code.trim() || !checks.every(Boolean)))
      )
        return fail();
    }
    for (const a of state.attempts) {
      if (
        !record(a) ||
        !Number.isSafeInteger(a.id) ||
        a.id <= 0 ||
        !text(a.lessonId) ||
        !text(a.questionId) ||
        !text(a.optionId) ||
        typeof a.correct !== "boolean" ||
        !date(a.createdAt)
      )
        return fail();
      findQuestion(a.lessonId, a.questionId);
      const feedback = gradeQuestion(a.lessonId, a.questionId, a.optionId);
      if (a.correct !== feedback.correct) return fail();
      // Regenerate explanations from trusted lesson content, rather than imported HTML/text.
      a.feedback = JSON.stringify(feedback);
    }
    if (
      !unique(state.progress, (x) => x.lessonId) ||
      !unique(state.notes, (x) => x.lessonId) ||
      !unique(state.bookmarks, (x) => x.lessonId) ||
      !unique(state.submissions, (x) => x.id) ||
      !unique(state.attempts, (x) => x.id)
    )
      return fail();
  } catch {
    return fail();
  }
  return state;
}
export function parseBackup(json: string): State {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return fail();
  }
  if (!record(value) || value.version !== 1) return fail();
  return validateState(value.state);
}
export function serializeBackup(state: State): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      state: validateState(state),
    } satisfies Backup,
    null,
    2,
  );
}
export function createStorage(
  getStorage: () => Pick<Storage, "getItem" | "setItem"> = () =>
    window.localStorage,
) {
  return {
    load(): State {
      let json: string | null;
      try {
        json = getStorage().getItem(STORAGE_KEY);
      } catch {
        throw new Error(
          "Trình duyệt đang chặn bộ nhớ cục bộ. Cho phép lưu dữ liệu cho trang này rồi thử lại.",
        );
      }
      if (json === null) return emptyState();
      return parseBackup(json); // Never silently reset a corrupt or unsupported save.
    },
    save(state: State): State {
      const clean = validateState(state);
      try {
        getStorage().setItem(STORAGE_KEY, serializeBackup(clean));
      } catch {
        throw new Error(
          "Không thể lưu trong trình duyệt. Bộ nhớ có thể đã đầy hoặc bị chặn. Bản đã lưu trước đó vẫn được giữ; hãy xuất bản sao lưu và thử lại.",
        );
      }
      return clean;
    },
  };
}
export const learningStorage = createStorage();
