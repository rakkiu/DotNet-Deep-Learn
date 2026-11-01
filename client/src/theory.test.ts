import { describe, it, expect } from "vitest";
import {
  curriculum,
  searchLessons,
  byId,
  examplesOf,
  questionsOf,
  pathModules,
  orderedLessons,
  readingMinutes,
} from "./theory";
describe("Theory curriculum integrity", () => {
  it("preserves all 41 lecture mappings and marks 12 additions separately", () => {
    expect(curriculum.parts.map((p) => p.number)).toEqual(
      Array.from({ length: 41 }, (_, i) => i + 1),
    );
    expect(new Set(curriculum.lessons.map((l) => l.id)).size).toBe(59);
    expect(
      curriculum.lessons.filter((l) => l.origin === "lecture"),
    ).toHaveLength(47);
    expect(
      curriculum.lessons.filter((l) => l.origin === "extension"),
    ).toHaveLength(12);
    for (const part of curriculum.parts)
      for (const id of part.lessons) {
        expect(byId.get(id)?.origin).toBe("lecture");
        expect(byId.get(id)?.sourceParts).toContain(part.number);
      }
    for (const l of curriculum.lessons) {
      if (l.origin === "extension") {
        expect(l.sourceParts).toEqual([]);
        expect(l.auditCode).toMatch(/^N\d{2}$/);
      } else
        for (const p of l.sourceParts)
          expect(
            curriculum.parts.find((x) => x.number === p)?.lessons,
          ).toContain(l.id);
    }
  });
  it("keeps legacy anchors, usable examples and 3 junior plus 2 middle explanations", () => {
    const legacy = [
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
      const anchors = l.sections.map((s) => s.id);
      expect(new Set(anchors).size, l.id).toBe(anchors.length);
      if (l.origin === "lecture")
        for (const anchor of legacy) expect(anchors, l.id).toContain(anchor);
      for (const anchor of [
        "junior",
        "middle",
        "questions",
        "resources",
        l.origin === "lecture" ? "variations" : "examples",
      ])
        expect(anchors, l.id).toContain(anchor);
      const qs = questionsOf(l);
      expect(
        qs.filter((q) => q.level === "junior"),
        l.id,
      ).toHaveLength(3);
      expect(
        qs.filter((q) => q.level === "middle"),
        l.id,
      ).toHaveLength(2);
      for (const q of qs)
        for (const text of [
          q.prompt,
          q.answer,
          q.explanation,
          q.misconception,
          q.followUp,
        ])
          expect(text.trim().length, l.id).toBeGreaterThan(0);
      expect(examplesOf(l).length, l.id).toBeGreaterThanOrEqual(2);
      for (const e of examplesOf(l)) {
        expect(e.expected, l.id).toBeTruthy();
        expect(e.input, l.id).toBeTruthy();
        expect(e.explanation.length, l.id).toBeGreaterThan(30);
        for (const [name, code] of Object.entries(e.files))
          if (name.endsWith(".cs"))
            expect(code, `${l.id}/${name}`).not.toMatch(/^dotnet /m);
        if (["console", "web", "compile-error"].includes(e.kind))
          expect(
            Object.keys(e.files).some((f) => f.endsWith(".csproj")),
            l.id,
          ).toBe(true);
      }
      const sources = l.sections.find((s) => s.id === "resources")!.links!;
      expect(sources.length, l.id).toBeGreaterThanOrEqual(2);
      expect(sources.length, l.id).toBeLessThanOrEqual(5);
      for (const source of sources) {
        expect(new URL(source.url).protocol).toBe("https:");
        expect(source.title.length).toBeGreaterThan(8);
      }
      expect(l.goals.length).toBeGreaterThanOrEqual(2);
      expect(l.version.sdk).toBe("10.0.403");
      expect(l.minutes).toBe(readingMinutes(l));
    }
  });
  it("has no grading or submission payloads and uses different reading estimates", () => {
    expect(JSON.stringify(curriculum)).not.toMatch(
      /"(exercises|correctOptionId|submissions|attempts|options|score)"\s*:/,
    );
    expect(
      new Set(curriculum.lessons.map((l) => l.minutes)).size,
    ).toBeGreaterThan(5);
  });
  it("searches body text and answers without Vietnamese accents, with intersecting filters", () => {
    expect(
      searchLessons("stampede").some((l) => l.id === "memory-caching"),
    ).toBe(true);
    expect(
      searchLessons("da hinh").some((l) => l.id === "oop-polymorphism"),
    ).toBe(true);
    expect(
      searchLessons("token", "web", "extension").every(
        (l) => l.category === "web" && l.origin === "extension",
      ),
    ).toBe(true);
    expect(searchLessons("this_word_has_no_match_9381")).toEqual([]);
    expect(
      searchLessons("ephemeral").some(
        (l) => l.id === "aspnet-identity-api-security",
      ),
    ).toBe(true);
  });
  it("has no dangling links, prerequisite cycles or duplicates in either full path", () => {
    for (const l of curriculum.lessons)
      for (const id of [...l.prerequisiteIds, ...l.relatedIds]) {
        expect(byId.has(id), `${l.id} -> ${id}`).toBe(true);
        expect(id).not.toBe(l.id);
      }
    const visited = new Set<string>(),
      visiting = new Set<string>();
    function visit(id: string) {
      expect(visiting.has(id), `cycle at ${id}`).toBe(false);
      if (visited.has(id)) return;
      visiting.add(id);
      for (const next of byId.get(id)!.prerequisiteIds) visit(next);
      visiting.delete(id);
      visited.add(id);
    }
    curriculum.lessons.forEach((l) => visit(l.id));
    expect(new Set(pathModules.flatMap((m) => m.ids)).size).toBe(59);
    for (const order of ["foundation", "interview"] as const) {
      const path = orderedLessons(curriculum.lessons[0], order);
      expect(path).toHaveLength(59);
      expect(new Set(path.map((l) => l.id)).size).toBe(59);
    }
    const foundation = orderedLessons(curriculum.lessons[0], "foundation").map(
      (l) => l.id,
    );
    for (const id of [
      "http-request-line",
      "dependency-injection",
      "async-await",
    ])
      expect(foundation.indexOf(id)).toBeLessThan(
        foundation.indexOf("aspnet-first-app"),
      );
  });
  it("separates migration demos from EnsureCreated and labels compiler errors", () => {
    const migration = examplesOf(byId.get("efcore-migrations")!)[0];
    expect(Object.values(migration.files).join("\n")).not.toContain(
      "EnsureCreated",
    );
    expect(migration.setup).toContain("dotnet ef migrations add");
    for (const l of curriculum.lessons)
      for (const e of examplesOf(l))
        if (e.kind === "compile-error") {
          expect(e.diagnostic).toMatch(/^CS\d+$/);
          expect(e.label).toContain("Cố ý");
        }
  });
});
