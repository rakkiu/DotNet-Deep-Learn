import { describe, it, expect } from "vitest";
import {
  oopPillars,
  byId,
  isOopLesson,
  orderedLessons,
  examplesOf,
  questionsOf,
  pathModules,
  searchLessons,
} from "./theory";
describe("Four OOP pillars at junior and middle depth", () => {
  it("covers the four distinct pillars in a coherent reading order", () => {
    expect(oopPillars.map((p) => p.title)).toEqual([
      "Đóng gói",
      "Trừu tượng",
      "Kế thừa",
      "Đa hình",
    ]);
    expect(
      orderedLessons(byId.get(oopPillars[0].id)!, "oop").map((l) => l.id),
    ).toEqual(oopPillars.map((p) => p.id));
    expect(isOopLesson(byId.get("oop-classes")!)).toBe(false);
    for (const pillar of oopPillars) {
      expect(isOopLesson(byId.get(pillar.id)!)).toBe(true);
      expect(pillar.junior).toHaveLength(3);
      expect(pillar.middle).toHaveLength(3);
    }
  });
  it("provides definitions, mechanisms, junior/middle analysis, design cases and explained code", () => {
    for (const pillar of oopPillars) {
      const lesson = byId.get(pillar.id)!;
      expect(lesson.origin).toBe("extension");
      expect(lesson.sourceParts).toEqual([]);
      expect(lesson.reviewedAt).toBe("2026-11-02");
      for (const id of [
        "identity",
        "problem",
        "benefits",
        "limits",
        "mechanism",
        "concepts",
        "integration",
        "junior",
        "middle",
        "examples",
        "case-study",
        "structure",
        "debug",
        "questions",
        "resources",
      ])
        expect(
          lesson.sections.some((s) => s.id === id),
          pillar.id + "/" + id,
        ).toBe(true);
      for (const level of ["junior", "middle"]) {
        const section = lesson.sections.find((s) => s.id === level)!;
        expect(
          section.paragraphs!.length,
          pillar.id + "/" + level,
        ).toBeGreaterThanOrEqual(4);
        for (const paragraph of section.paragraphs!)
          expect(paragraph.trim()).not.toBe("");
      }
      expect(
        lesson.sections.find((s) => s.id === "concepts")!.definitions!.length,
      ).toBeGreaterThanOrEqual(4);
      expect(
        examplesOf(lesson).filter((e) => e.kind === "console"),
      ).toHaveLength(3);
      expect(
        examplesOf(lesson).filter((e) => e.kind === "compile-error"),
      ).toHaveLength(1);
      expect(
        questionsOf(lesson).filter((q) => q.level === "junior"),
      ).toHaveLength(3);
      expect(
        questionsOf(lesson).filter((q) => q.level === "middle"),
      ).toHaveLength(2);
    }
  });
  it("keeps prerequisites earlier in the foundation path and searches the new conceptual content", () => {
    const path = pathModules.flatMap((m) => m.ids);
    for (const pillar of oopPillars) {
      const lesson = byId.get(pillar.id)!;
      for (const prerequisite of lesson.prerequisiteIds)
        expect(
          path.indexOf(prerequisite),
          pillar.id + " requires " + prerequisite,
        ).toBeLessThan(path.indexOf(pillar.id));
    }
    expect(
      searchLessons("ownership").some((l) => l.id === "oop-encapsulation-deep"),
    ).toBe(true);
    expect(
      searchLessons("LSP").some((l) => l.id === "oop-inheritance-deep"),
    ).toBe(true);
    expect(
      searchLessons("boxing", "architecture", "extension").some(
        (l) => l.id === "oop-polymorphism-deep",
      ),
    ).toBe(true);
  });
});
