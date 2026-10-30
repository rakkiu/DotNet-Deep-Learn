import { describe, it, expect } from "vitest";
import { content } from "./content";
const lessons = content.lessons;
describe("published curriculum integrity", () => {
  it("covers all 41 source chapters once and preserves two supplementary lessons", () => {
    expect(lessons).toHaveLength(43);
    expect(
      lessons
        .flatMap((l) => (l.sourceOrder ? [l.sourceOrder] : []))
        .sort((a, b) => a - b),
    ).toEqual(Array.from({ length: 41 }, (_, i) => i + 1));
    expect(lessons.filter((l) => !l.sourceOrder).map((l) => l.id)).toEqual([
      "linq-deferred",
      "sql-left-join",
    ]);
  });
  it("uses stable unique IDs and valid question anchors/options", () => {
    const ids = lessons.flatMap((l) => [
      l.id,
      ...l.questions.map((q) => q.id),
      ...l.examples.map((e) => e.id),
      ...l.exercises.map((e) => e.id),
    ]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of lessons) {
      expect(l.examples).toHaveLength(2);
      expect(l.questions).toHaveLength(5);
      expect(l.exercises).toHaveLength(3);
      expect(l.definitions?.length).toBeGreaterThanOrEqual(3);
      expect(l.environment).toBeTruthy();
      for (const q of l.questions) {
        expect(l.sections.some((s) => s.id === q.sectionId)).toBe(true);
        expect(
          q.options.filter((o) => o.id === q.correctOptionId),
        ).toHaveLength(1);
        expect(new Set(q.options.map((o) => o.text)).size).toBe(
          q.options.length,
        );
      }
    }
  });
  it("makes input, dependencies and fixture limits explicit for web/EF lessons", () => {
    for (const l of lessons.filter((l) =>
      [
        "mvc-views",
        "mvc-binding",
        "efcore-context",
        "httpclient-json",
      ].includes(l.id),
    )) {
      expect(l.environment).toContain(".NET 10");
      if (l.id === "mvc-views")
        expect(l.examples[0].files).toHaveProperty("Views/Home/Index.cshtml");
      if (l.id === "mvc-binding")
        expect(l.examples[0].request).toMatchObject({
          method: "POST",
          body: { age: 17 },
        });
      if (l.id === "efcore-context")
        expect(l.environment).toContain("Microsoft.EntityFrameworkCore.Sqlite");
      if (l.id === "httpclient-json")
        expect(l.examples[0].code).toContain("FixtureHandler");
    }
  });
  it("keeps legacy answers and checklist shape compatible with saved history", () => {
    const oop = lessons.find((l) => l.id === "oop-polymorphism")!;
    expect(oop.questions.map((q) => [q.id, q.correctOptionId])).toEqual([
      ["oop-q-concept", "a"],
      ["oop-q-predict", "b"],
      ["oop-q-cause", "b"],
      ["oop-q-distinguish", "a"],
      ["oop-q-apply", "c"],
    ]);
    expect(oop.exercises.map((e) => [e.id, e.checklist.length])).toEqual([
      ["oop-e-fill", 3],
      ["oop-e-debug", 3],
      ["oop-e-design", 3],
    ]);
  });
  it("teaches corrected boundaries for async, EF loading and HTTP framing", () => {
    const text = (id: string) =>
      JSON.stringify(lessons.find((l) => l.id === id));
    expect(text("async-await")).toContain("async không tự tạo thread");
    expect(text("efcore-relationships")).toContain(
      "Include không luôn tạo đúng một SQL",
    );
    expect(text("http-response")).toContain("5 byte UTF-8");
    expect(text("csharp-arrays")).toContain("definite assignment");
  });
});
