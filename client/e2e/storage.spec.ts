import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const key = "dotnet-deep-learn:state:v1";
const calls = new WeakMap<object, string[]>();
test.beforeEach(async ({ page }) => {
  const list: string[] = [];
  calls.set(page, list);
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) list.push(r.url());
  });
  await page.route("**/api/**", (r) => r.abort());
});
test.afterEach(async ({ page }) => expect(calls.get(page)).toEqual([]));
test("corrupt local data can be backed up and explicitly restored without silent data loss", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "corrupt data to recover"),
    key,
  );
  await page.goto("/#/");
  await expect(
    page.getByRole("heading", { name: "Chưa tải được không gian học" }),
  ).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(
    "corrupt data to recover",
  );
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Tải dữ liệu hiện có để khôi phục" })
    .click();
  const d = await downloadPromise;
  expect(readFileSync((await d.path())!, "utf8")).toBe(
    "corrupt data to recover",
  );
  await page
    .getByLabel("Nhập tệp sao lưu JSON", { exact: true })
    .setInputFiles({
      name: "recovery.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          version: 1,
          state: {
            progress: [],
            notes: [],
            bookmarks: [],
            submissions: [],
            attempts: [],
          },
        }),
      ),
    });
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(
    "corrupt data to recover",
  );
  await page.getByRole("button", { name: "Thay thế bằng bản sao lưu" }).click();
  await expect(page.locator("h1")).toContainText("Học điều mới.");
});
test("storage quota failures keep drafts and previous saves, and retry works", async ({
  page,
}) => {
  await page.goto("/#/lessons/sql-left-join/explain");
  if (!(await page.getByLabel("Điều bạn muốn ghi nhớ").isVisible()))
    await page.locator(".personal-notes > summary").click();
  await page.getByLabel("Điều bạn muốn ghi nhớ").fill("Bản đã lưu");
  await page.getByRole("button", { name: "Lưu ghi chú", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu ghi chú");
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem;
    (window as unknown as { restoreStorage: () => void }).restoreStorage =
      () => {
        Storage.prototype.setItem = original;
      };
    Storage.prototype.setItem = function (k, v) {
      if (k === key) throw new DOMException("Full", "QuotaExceededError");
      original.call(this, k, v);
    };
  }, key);
  if (!(await page.getByLabel("Điều bạn muốn ghi nhớ").isVisible()))
    await page.locator(".personal-notes > summary").click();
  await page.getByLabel("Điều bạn muốn ghi nhớ").fill("Bản nháp chưa lưu");
  await page.getByRole("button", { name: "Lưu ghi chú", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Không thể lưu trong trình duyệt",
  );
  await expect(page.getByLabel("Điều bạn muốn ghi nhớ")).toHaveValue(
    "Bản nháp chưa lưu",
  );
  expect(
    JSON.parse((await page.evaluate((k) => localStorage.getItem(k), key))!)
      .state.notes[0].text,
  ).toBe("Bản đã lưu");
  await page.evaluate(() =>
    (window as unknown as { restoreStorage: () => void }).restoreStorage(),
  );
  await page.getByRole("button", { name: "Lưu ghi chú", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("Điều bạn muốn ghi nhớ")).toHaveValue(
    "Bản nháp chưa lưu",
  );
});
test("export/import keeps history, rejects bad files and requires confirmation", async ({
  page,
}) => {
  await page.goto("/#/lessons/oop-polymorphism/quiz");
  const q = page.locator('[data-question="oop-q-concept"]');
  await q.locator(".choice").nth(1).click();
  await q.getByRole("button", { name: "Gửi câu trả lời", exact: true }).click();
  if (!(await page.getByLabel("Điều bạn muốn ghi nhớ").isVisible()))
    await page.locator(".personal-notes > summary").click();
  await page.getByLabel("Điều bạn muốn ghi nhớ").fill("Sao lưu ghi chú");
  await page.getByRole("button", { name: "Lưu ghi chú", exact: true }).click();
  await page.goto("/#/data");
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất bản sao lưu" }).click();
  const download = await event,
    backup = JSON.parse(readFileSync((await download.path())!, "utf8"));
  expect(backup.version).toBe(1);
  expect(backup.state.attempts).toHaveLength(1);
  expect(backup.state.notes[0].text).toBe("Sao lưu ghi chú");
  const before = await page.evaluate((k) => localStorage.getItem(k), key);
  await page
    .getByLabel("Nhập tệp sao lưu JSON", { exact: true })
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":99}'),
    });
  await expect(page.getByRole("alert")).toContainText(
    "Dữ liệu lưu không hợp lệ",
  );
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(before);
  backup.state.notes[0].text = "Đã khôi phục từ tệp";
  await page
    .getByLabel("Nhập tệp sao lưu JSON", { exact: true })
    .setInputFiles({
      name: "good.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });
  await expect(
    page.getByRole("heading", { name: "Kiểm tra trước khi khôi phục" }),
  ).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(before);
  await page.getByRole("button", { name: "Thay thế bằng bản sao lưu" }).click();
  await page.goto("/#/lessons/oop-polymorphism/explain");
  await expect(page.getByLabel("Điều bạn muốn ghi nhớ")).toHaveValue(
    "Đã khôi phục từ tệp",
  );
  await page.goto("/#/review");
  await expect(page.locator('[data-question="oop-q-concept"]')).toBeVisible();
});
test("learning works with network disabled after initial static assets load", async ({
  page,
  context,
}) => {
  await page.goto("/#/lessons/linq-deferred/quiz");
  await expect(page.locator("h1")).toBeVisible();
  await context.setOffline(true);
  const q = page.locator('[data-question="linq-q-concept"]');
  await q.locator(".choice").nth(1).click();
  await q.getByRole("button", { name: "Gửi câu trả lời", exact: true }).click();
  await expect(q.locator(".quiz-feedback")).toContainText("Chính xác");
  if (!(await page.getByLabel("Điều bạn muốn ghi nhớ").isVisible()))
    await page.locator(".personal-notes > summary").click();
  await page.getByLabel("Điều bạn muốn ghi nhớ").fill("Lưu khi không có mạng");
  await page.getByRole("button", { name: "Lưu ghi chú", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu ghi chú");
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByLabel("Điều bạn muốn ghi nhớ")).toHaveValue(
    "Lưu khi không có mạng",
  );
});
test("browser profiles are isolated and two tabs keep separate edits", async ({
  page,
  context,
  browser,
}) => {
  await page.goto("/#/lessons/oop-polymorphism/explain");
  const other = await context.newPage();
  await other.goto("/#/lessons/sql-left-join/explain");
  if (!(await page.getByLabel("Điều bạn muốn ghi nhớ").isVisible()))
    await page.locator(".personal-notes > summary").click();
  await page.getByLabel("Điều bạn muốn ghi nhớ").fill("Ghi chú OOP ở tab một");
  await page.getByRole("button", { name: "Lưu ghi chú", exact: true }).click();
  await other.locator(".personal-notes > summary").click();
  await other.getByLabel("Điều bạn muốn ghi nhớ").fill("Ghi chú SQL ở tab hai");
  await other.getByRole("button", { name: "Lưu ghi chú", exact: true }).click();
  await page.reload();
  expect(
    JSON.parse((await page.evaluate((k) => localStorage.getItem(k), key))!)
      .state.notes,
  ).toHaveLength(2);
  const isolated = await browser.newContext();
  const clean = await isolated.newPage();
  await clean.goto("/#/lessons/oop-polymorphism/explain");
  await expect(clean.getByLabel("Điều bạn muốn ghi nhớ")).toHaveValue("");
  await isolated.close();
});
