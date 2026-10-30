import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("WCAG A/AA on library, Console/web lessons, exercises, backup and dark mode", async ({
  page,
}) => {
  const violations: unknown[] = [];
  for (const path of [
    "/",
    "/lessons/oop-polymorphism/explain",
    "/lessons/sql-left-join/examples",
    "/lessons/mvc-views/explain",
    "/lessons/mvc-binding/quiz",
    "/lessons/efcore-context/exercises",
    "/data",
  ]) {
    await page.goto("/#" + path);
    await expect(page.locator("h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    violations.push(
      ...result.violations.map((v) => ({
        path,
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    );
  }
  await page.goto("/#/");
  await page.getByRole("button", { name: "Chuyển sang giao diện tối" }).click();
  const dark = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  violations.push(
    ...dark.violations.map((v) => ({
      path: "dark",
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  );
  expect(violations).toEqual([]);
});
