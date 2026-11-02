import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { inflateRawSync } from "node:zlib";
import encapsulation from "../src/data/articles/oop-encapsulation-deep.json" with { type: "json" };
import abstraction from "../src/data/articles/oop-abstraction-deep.json" with { type: "json" };
import inheritance from "../src/data/articles/oop-inheritance-deep.json" with { type: "json" };
import polymorphism from "../src/data/articles/oop-polymorphism-deep.json" with { type: "json" };
const lessons = [encapsulation, abstraction, inheritance, polymorphism];
test("OOP hub switches reading depth, persists the level and reaches the chosen section", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page
    .locator(".oop-callout")
    .getByRole("link", { name: "Mở chuyên đề" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Bốn tính chất",
  );
  await expect(page.locator(".oop-pillar")).toHaveCount(4);
  await expect(page.locator(".oop-hero-facts")).toContainText("16");
  await expect(page.locator(".oop-hero-facts")).toContainText("20");
  const middle = page.getByRole("button", { name: /^Middle/ });
  await middle.focus();
  await page.keyboard.press("Enter");
  await expect(middle).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(middle).toHaveAttribute("aria-pressed", "true");
  await page
    .locator(".oop-pillar")
    .first()
    .getByRole("link", { name: "Đọc phần middle" })
    .click();
  await expect(page).toHaveURL(/oop-encapsulation-deep\?order=oop#middle$/);
  await expect(page.locator("#middle")).toBeFocused();
  await page
    .locator(".oop-reader-nav")
    .getByRole("link", { name: "Đọc junior" })
    .click();
  await expect(page).toHaveURL(/order=oop#junior$/);
  await page.locator(".article-pagination a").last().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    abstraction.title,
  );
  await expect(page.locator(".pagination-order")).toContainText(
    "Chuyên đề 4 tính chất OOP",
  );
  if (isMobile)
    await page.getByRole("button", { name: "Mở mục lục", exact: true }).click();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: /OOP chuyên sâu/ })
    .click();
  await expect(page).toHaveURL(/#\/oop$/);
});
test("OOP deep links render all theory and a visible answer without grading; invalid OOP order falls back", async ({
  page,
}) => {
  for (const lesson of lessons) {
    await page.goto("/#/read/" + lesson.id + "#middle");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      lesson.title,
    );
    await expect(page.locator(".article-section")).toHaveCount(15);
    await expect(page.locator(".worked-example")).toHaveCount(4);
    await expect(page.locator(".qa")).toHaveCount(5);
    await expect(page.locator("#reading-order")).toHaveValue("oop");
    await page.locator(".qa summary").last().click();
    await expect(page.locator(".qa[open] .qa-answer")).toBeVisible();
  }
  await expect(
    page.getByRole("button", { name: /Nộp bài|Chấm điểm|Hoàn thành bài/ }),
  ).toHaveCount(0);
  await page.goto("/#/read/csharp-types?order=oop");
  await expect(page.locator("#reading-order")).toHaveValue("lecture");
  await expect(page.locator('#reading-order option[value="oop"]')).toHaveCount(
    0,
  );
});
test("downloaded ZIP contains the exact OOP source and isolates intentional compiler errors", async ({
  request,
}) => {
  const response = await request.get("/examples/dotnet-labs.zip");
  expect(response.status()).toBe(200);
  const zip = await response.body();
  const entries = new Map<string, string>();
  let offset = 0;
  while (zip.readUInt32LE(offset) === 0x04034b50) {
    const size = zip.readUInt32LE(offset + 18),
      length = zip.readUInt16LE(offset + 26),
      extra = zip.readUInt16LE(offset + 28),
      name = zip.subarray(offset + 30, offset + 30 + length).toString("utf8"),
      start = offset + 30 + length + extra;
    expect(zip.readUInt16LE(offset + 8)).toBe(8);
    entries.set(
      name,
      inflateRawSync(zip.subarray(start, start + size)).toString("utf8"),
    );
    offset = start + size;
  }
  let count = 0;
  for (const lesson of lessons)
    for (const example of lesson.sections.flatMap((s) =>
      "examples" in s ? s.examples : [],
    )) {
      const folder = `examples/OopLab/${lesson.id}/${example.id}`;
      for (const [name, source] of Object.entries(example.files))
        expect(entries.get(folder + "/" + name)).toBe(source);
      expect(entries.get(folder + "/README.md")).toContain(example.expected);
      count++;
    }
  expect(count).toBe(16);
  expect(entries.get("examples/OopLab/README.md")).toContain(
    "intentionally fail",
  );
  expect([...entries.keys()].some((name) => /\/(bin|obj)\//.test(name))).toBe(
    false,
  );
});
test("OOP hub, depth controls and reader remain accessible and fit the viewport in both themes", async ({
  page,
  isMobile,
}) => {
  if (isMobile) await page.setViewportSize({ width: 390, height: 844 });
  for (const url of [
    "/#/oop",
    "/#/oop?level=middle",
    "/#/read/oop-polymorphism-deep#junior",
  ]) {
    await page.goto(url);
    for (const theme of ["light", "dark"]) {
      if ((await page.locator("html").getAttribute("data-theme")) !== theme)
        await page
          .getByRole("button", {
            name: theme === "dark" ? "Giao diện tối" : "Giao diện sáng",
            exact: true,
          })
          .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  }
});
