import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import data from "../src/data/theory.json" with { type: "json" };
test("library, body search, accents, filters and clear state", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Hiểu công nghệ",
  );
  await expect(page.locator(".article-card")).toHaveCount(63);
  const search = page.getByRole("textbox", {
    name: "Tìm trong nội dung bài viết",
  });
  await search.fill("stampede");
  await expect(page.locator(".article-card")).toHaveCount(1);
  await expect(page.locator(".article-card")).toContainText("Cache");
  await search.fill("da hinh");
  await expect(
    page.locator(".article-card").filter({ hasText: "Đa hình: override" }),
  ).toHaveCount(1);
  await search.fill("no-match-029938");
  await expect(
    page.getByRole("heading", { name: "Chưa tìm thấy nội dung phù hợp" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await expect(page.locator(".article-card")).toHaveCount(63);
  await page
    .getByRole("button", { name: "Đồng thời & bất đồng bộ", exact: true })
    .click();
  await expect(page.locator(".article-card")).toHaveCount(8);
  await page.reload();
  await expect(page.locator(".article-card")).toHaveCount(8);
});
test("all 63 deep links render theory, examples and explanatory disclosures", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const l of data.lessons) {
    await page.goto(`/#/read/${l.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(l.title);
    await expect(page.locator(".article-section")).toHaveCount(
      l.origin === "lecture" || l.auditCode.startsWith("OOP") ? 15 : 7,
    );
    await expect(page.locator(".code-block").first()).toBeVisible();
    await expect(page.locator(".qa")).toHaveCount(5);
    expect(
      await page.locator(".worked-example").count(),
    ).toBeGreaterThanOrEqual(2);
    await expect(page.locator("#resources a")).toHaveCount(l.resourceCount);
  }
  expect(errors).toEqual([]);
  await expect(
    page.getByRole("button", { name: /Nộp|Chấm|Trả lời|Đánh dấu hoàn thành/ }),
  ).toHaveCount(0);
});
test("table of contents, font controls, history and legacy links", async ({
  page,
  isMobile,
}) => {
  await page.goto("/#/lessons/async-await/quiz");
  await expect(page).toHaveURL(/#\/read\/async-await$/);
  if (isMobile || (await page.locator(".mobile-toc").isVisible()))
    await page.locator(".mobile-toc summary").click();
  const toc = isMobile
    ? page.locator(".mobile-toc")
    : page.locator(".desktop-toc");
  await toc.getByRole("link", { name: "05 Cơ chế hoạt động cốt lõi" }).click();
  await expect(page).toHaveURL(/#mechanism$/);
  await expect(page.locator("#mechanism")).toBeFocused();
  await page.getByRole("button", { name: "Tăng cỡ chữ bài viết" }).click();
  await expect(page.locator(".reader-layout")).toHaveClass(/large-type/);
  await page.locator(".article-pagination a").last().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Task.WhenAll, WhenAny và quan sát lỗi",
  );
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "async/await — cơ chế bất đồng bộ",
  );
  await page.goto("/#/read/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Chưa có bài viết này" }),
  ).toBeVisible();
});
test("source coverage maps all lectures to articles", async ({ page }) => {
  await page.goto("/#/sources");
  await expect(page.locator(".coverage-list>section")).toHaveCount(41);
  await page
    .locator(".coverage-list>section")
    .nth(14)
    .getByRole("link", { name: "Decorator — mở rộng bằng cách bọc" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Decorator — mở rộng bằng cách bọc",
  );
});

test("reading paths, extension origin, disclosure answers and labelled order", async ({
  page,
}) => {
  await page.goto("/#/paths/foundation");
  await expect(page.locator(".path-module")).toHaveCount(6);
  await expect(page.locator(".path-module li")).toHaveCount(63);
  await page
    .locator(".path-switch")
    .getByRole("link", { name: "Ôn phỏng vấn", exact: true })
    .click();
  await page.locator(".path-module li a").first().click();
  await expect(page).toHaveURL(/order=interview#questions$/);
  const answer = page.locator(".qa").first();
  await expect(answer).not.toHaveAttribute("open");
  await answer.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(answer).toHaveAttribute("open", "");
  await expect(
    answer.getByRole("heading", { name: "Hiểu nhầm thường gặp" }),
  ).toBeVisible();
  await page.locator(".article-pagination a").last().click();
  await expect(page).toHaveURL(/order=interview#questions$/);
  await page.goto("/#/read/csharp-value-modeling");
  await expect(page.locator(".article-header .eyebrow")).toContainText(
    "MỞ RỘNG ĐỂ ÔN PHỎNG VẤN",
  );
  await expect(page.locator(".article-facts")).toContainText("7 mục");
  await expect(
    page.locator('#reading-order option[value="lecture"]'),
  ).toHaveCount(0);
  await page.goto("/#/sources");
  await expect(page.locator(".extension-list>a")).toHaveCount(16);
  await page.goto("/#/?origin=extension");
  await expect(page.locator(".article-card")).toHaveCount(16);
  const download = await page.request.get("/examples/dotnet-labs.zip");
  expect(download.status()).toBe(200);
  expect((await download.body()).subarray(0, 2).toString()).toBe("PK");
});

test("copy contains only the displayed source, tables scroll independently and intro stays complete", async ({
  page,
  context,
  browserName,
}) => {
  await page.goto("/#/read/csharp-types#variations");
  const block = page
    .locator("#variations .code-block")
    .filter({
      has: page.locator(".code-toolbar>span", { hasText: "Program.cs" }),
    })
    .first();
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await block
      .getByRole("button", { name: "Sao chép Program.cs", exact: true })
      .click();
    expect(
      (await page.evaluate(() => navigator.clipboard.readText())).replaceAll(
        "\r\n",
        "\n",
      ),
    ).toBe(await block.locator("code").innerText());
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/#/read/efcore-relationships");
  const deck = page.locator(".article-deck");
  expect((await deck.innerText()).endsWith("…")).toBe(false);
  await page.goto("/#/guide");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("debug");
});
test("reading is available when old data is corrupt and localStorage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("dotnet-deep-learn:state:v1", "broken old data");
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new Error("Storage blocked");
      },
    });
    Object.defineProperty(Storage.prototype, "getItem", {
      value: () => {
        throw new Error("Storage blocked");
      },
    });
  });
  await page.goto("/#/read/dotnet-first-program");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    ".NET — nền tảng",
  );
  await page
    .getByRole("button", { name: "Giao diện tối", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("layout, mobile menu and keyboard search", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Mở mục lục" }).click();
    await expect(page.locator(".sidebar")).toHaveClass(/is-open/);
    await page
      .locator(".sidebar")
      .getByRole("link", { name: /Theo bài giảng/ })
      .click();
    await expect(page.locator(".sidebar")).not.toHaveClass(/is-open/);
  }
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("textbox", { name: "Tìm toàn bộ thư viện" }),
  ).toBeFocused();
  await page
    .getByRole("textbox", { name: "Tìm toàn bộ thư viện" })
    .fill("reflection");
  await page.keyboard.press("Enter");
  await expect(
    page.locator(".article-card").filter({ hasText: "Reflection và metadata" }),
  ).toHaveCount(1);
  for (const url of [
    "/#/",
    "/#/read/efcore-relationships",
    "/#/sources",
    "/#/read/csharp-types#junior",
    "/#/paths/foundation",
    "/#/guide",
  ]) {
    await page.goto(url);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
test("light and dark library and reader pass accessibility checks", async ({
  page,
}) => {
  for (const url of [
    "/#/",
    "/#/read/async-await",
    "/#/paths/foundation",
    "/#/read/aspnet-web-api-design#questions",
  ]) {
    await page.goto(url);
    for (const dark of [false, true]) {
      if (dark)
        await page
          .getByRole("button", { name: "Giao diện tối", exact: true })
          .click();
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        dark ? "dark" : "light",
      );
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
    await page
      .getByRole("button", { name: "Giao diện sáng", exact: true })
      .click();
  }
});
