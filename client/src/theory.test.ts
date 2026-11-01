import { describe, it, expect } from "vitest";
import { curriculum, searchLessons } from "./theory";
describe("Theory curriculum integrity", () => {
  it("covers every numbered lecture and expands distinct technologies without orphan links", () => {
    expect(curriculum.parts.map((p) => p.number)).toEqual(
      Array.from({ length: 41 }, (_, i) => i + 1),
    );
    expect(new Set(curriculum.lessons.map((l) => l.id)).size).toBe(47);
    for (const p of curriculum.parts) {
      expect(p.lessons.length).toBeGreaterThan(0);
      for (const id of p.lessons)
        expect(
          curriculum.lessons.find((l) => l.id === id)?.sourceParts,
        ).toContain(p.number);
    }
  });
  it("contains eleven complete theory sections, code context and official resources for every article", () => {
    const ids = [
      "identity",
      "problem",
      "benefits",
      "limits",
      "mechanism",
      "concepts",
      "integration",
      "hello",
      "structure",
      "debug",
      "resources",
    ];
    for (const l of curriculum.lessons) {
      expect(
        l.sections.map((s) => s.id),
        l.id,
      ).toEqual(ids);
      expect(curriculum.categories.some((c) => c.id === l.category)).toBe(true);
      for (const id of [
        "identity",
        "problem",
        "benefits",
        "limits",
        "mechanism",
        "integration",
        "debug",
      ])
        expect(
          l.sections.find((s) => s.id === id)?.paragraphs?.join(" ").length,
          `${l.id}/${id}`,
        ).toBeGreaterThan(120);
      const hello = l.sections.find((s) => s.id === "hello")!.hello!;
      expect(hello.code.length).toBeGreaterThan(20);
      expect(hello.setup.length).toBeGreaterThan(20);
      expect(hello.output).toBeTruthy();
      expect(hello.steps.length).toBeGreaterThan(0);
      expect(
        l.sections.find((s) => s.id === "concepts")!.definitions!.length,
      ).toBeGreaterThanOrEqual(3);
      for (const resource of l.sections.find((s) => s.id === "resources")!
        .links!)
        expect(new URL(resource.url).protocol).toBe("https:");
    }
  });
  it("has no exercise, quiz, grading or submission payloads", () => {
    const raw = JSON.stringify(curriculum);
    expect(raw).not.toMatch(
      /"(questions|exercises|correctOptionId|submissions|attempts|options)"\s*:/,
    );
  });
  it("finds concepts in body text and Vietnamese without accents, with intersecting filters", () => {
    expect(
      searchLessons("stampede").some((l) => l.id === "memory-caching"),
    ).toBe(true);
    expect(
      searchLessons("da hinh").some((l) => l.id === "oop-polymorphism"),
    ).toBe(true);
    expect(
      searchLessons("dong thoi", "concurrency").every(
        (l) => l.category === "concurrency",
      ),
    ).toBe(true);
    expect(searchLessons("this_word_has_no_match_9381")).toEqual([]);
  });
  it("keeps the migration demo distinct from EnsureCreated and documents async limits", () => {
    const migration = curriculum.lessons
      .find((l) => l.id === "efcore-migrations")!
      .sections.find((s) => s.id === "hello")!.hello!;
    expect(migration.code).not.toContain("EnsureCreated");
    expect(migration.setup).toContain("dotnet ef migrations add");
    const async = curriculum.lessons.find((l) => l.id === "async-await")!;
    expect(
      async.sections.find((s) => s.id === "mechanism")!.paragraphs!.join(" "),
    ).toContain("đã hoàn thành");
  });
});
