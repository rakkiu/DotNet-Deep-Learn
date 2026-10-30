import { describe, it, expect } from "vitest";
import { catalog, content, gradeQuestion, predictExample } from "./content";
import {
  createStorage,
  emptyState,
  parseBackup,
  serializeBackup,
  STORAGE_KEY,
  validateState,
} from "./storage";
import { metrics, pendingReview, type Attempt } from "./types";
const attempt = (id: number, optionId: string): Attempt => {
  const lessonId = "oop-polymorphism",
    questionId = "oop-q-concept",
    f = gradeQuestion(lessonId, questionId, optionId);
  return {
    id,
    lessonId,
    questionId,
    optionId,
    correct: f.correct,
    feedback: JSON.stringify(f),
    createdAt: "2026-10-30T03:00:00Z",
  };
};
function memory() {
  const values = new Map<string, string>();
  let full = false;
  const storage = createStorage(() => ({
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      if (full) throw new Error("Quota exceeded");
      values.set(k, v);
    },
  }));
  return {
    values,
    storage,
    fill: () => {
      full = true;
    },
  };
}
describe("client-side grading", () => {
  for (const lesson of content.lessons)
    for (const q of lesson.questions) {
      it(`grades every option in ${q.id} with individual explanations`, () => {
        for (const o of q.options) {
          const f = gradeQuestion(lesson.id, q.id, o.id);
          expect(f.correct).toBe(o.id === q.correctOptionId);
          expect(f.options.every((x) => !!x.explanation)).toBe(true);
          expect(f.correctOptionId).toBe(q.correctOptionId);
        }
      });
    }
  it("rejects invalid option, mismatched lesson and missing question", () => {
    expect(() =>
      gradeQuestion("oop-polymorphism", "oop-q-concept", "z"),
    ).toThrow();
    expect(() =>
      gradeQuestion("sql-left-join", "oop-q-concept", "a"),
    ).toThrow();
    expect(() => gradeQuestion("missing", "missing", "a")).toThrow();
  });
  for (const l of content.lessons)
    for (const e of l.examples)
      it(`predicts ${e.id}`, () => {
        expect(predictExample(l.id, e.id, e.correctOptionId)).toMatchObject({
          correct: true,
          output: e.output,
          steps: e.steps,
        });
        expect(
          predictExample(
            l.id,
            e.id,
            e.options.find((o) => o.id !== e.correctOptionId)!.id,
          ).correct,
        ).toBe(false);
      });
  it("keeps explanations out of presentation questions until submission", () => {
    for (const l of catalog.lessons)
      for (const q of l.questions) {
        expect(q).not.toHaveProperty("correctOptionId");
        expect(q).not.toHaveProperty("explanation");
        expect(q.options[0]).not.toHaveProperty("explanation");
      }
  });
});
describe("local data, history and restore", () => {
  it("starts empty without writing anything", () => {
    const { storage, values } = memory();
    expect(storage.load()).toEqual(emptyState());
    expect(values.size).toBe(0);
  });
  it("preserves all learner data through storage and backup round trips", () => {
    const { storage } = memory();
    const s = emptyState();
    s.progress = [
      {
        lessonId: "oop-polymorphism",
        section: "exercises",
        read: true,
        updatedAt: "2026-10-30T03:00:00Z",
      },
    ];
    s.notes = [
      { lessonId: "oop-polymorphism", text: "Hiểu virtual / override" },
    ];
    s.bookmarks = [{ lessonId: "oop-polymorphism" }];
    s.attempts = [attempt(1, "b"), attempt(2, "a")];
    s.submissions = [
      {
        id: "oop-polymorphism:oop-e-fill",
        lessonId: "oop-polymorphism",
        exerciseId: "oop-e-fill",
        code: "my draft",
        checks: "[true,true,true]",
        assessed: true,
        updatedAt: "2026-10-30T03:00:00Z",
      },
    ];
    expect(storage.save(s)).toEqual(s);
    expect(storage.load()).toEqual(s);
    expect(parseBackup(serializeBackup(s))).toEqual(s);
  });
  it("review uses latest answer without deleting earlier failures", () => {
    const s = emptyState();
    s.attempts = [attempt(1, "b")];
    expect(pendingReview(s.attempts)).toHaveLength(1);
    s.attempts.push(attempt(2, "a"));
    expect(pendingReview(s.attempts)).toHaveLength(0);
    expect(s.attempts).toHaveLength(2);
    s.attempts.push(attempt(3, "c"));
    expect(pendingReview(s.attempts)).toHaveLength(1);
  });
  it("reading or one correct quiz answer does not complete a lesson", () => {
    const s = emptyState();
    s.progress = [
      {
        lessonId: "oop-polymorphism",
        section: "quiz",
        read: true,
        updatedAt: "2026-10-30T03:00:00Z",
      },
    ];
    s.attempts = [attempt(1, "a")];
    expect(metrics(catalog.lessons[0], s)).toMatchObject({
      complete: false,
      read: true,
      correct: 1,
      assessed: 0,
    });
  });
  it("preserves corrupt or unsupported storage instead of silently resetting", () => {
    const { storage, values } = memory();
    for (const raw of ["broken JSON", '{"version":99,"state":{}}']) {
      values.set(STORAGE_KEY, raw);
      expect(() => storage.load()).toThrow();
      expect(values.get(STORAGE_KEY)).toBe(raw);
    }
  });
  it("failed writes preserve the last saved data and reject success", () => {
    const { storage, values, fill } = memory();
    storage.save(emptyState());
    const before = values.get(STORAGE_KEY);
    fill();
    const s = emptyState();
    s.notes = [{ lessonId: "oop-polymorphism", text: "not saved" }];
    expect(() => storage.save(s)).toThrow("Không thể lưu");
    expect(values.get(STORAGE_KEY)).toBe(before);
  });
  it("reports storage access blocked", () => {
    const s = createStorage(() => {
      throw new Error("SecurityError");
    });
    expect(() => s.load()).toThrow("chặn bộ nhớ");
  });
  it("rejects duplicate IDs, unknown lessons, forged correctness and invalid checklist", () => {
    const cases = Array.from({ length: 4 }, emptyState);
    cases[0].attempts = [attempt(1, "a"), attempt(1, "b")];
    cases[1].notes = [{ lessonId: "missing", text: "x" }];
    cases[2].attempts = [{ ...attempt(1, "b"), correct: true }];
    cases[3].submissions = [
      {
        id: "oop-polymorphism:oop-e-fill",
        lessonId: "oop-polymorphism",
        exerciseId: "oop-e-fill",
        code: "",
        checks: "[true,true,true]",
        assessed: true,
        updatedAt: "2026-10-30T03:00:00Z",
      },
    ];
    for (const s of cases) expect(() => validateState(s)).toThrow();
  });
  it("validates imports and regenerates feedback from current lesson content", () => {
    expect(() => parseBackup('{"version":1,"state":null}')).toThrow();
    const s = emptyState();
    s.attempts = [{ ...attempt(1, "a"), feedback: "injected content" }];
    const restored = parseBackup(JSON.stringify({ version: 1, state: s }));
    expect(JSON.parse(restored.attempts[0].feedback).correctOptionId).toBe("a");
  });
});
