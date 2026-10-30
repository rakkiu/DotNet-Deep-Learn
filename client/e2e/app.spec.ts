import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  const apiCalls: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) apiCalls.push(r.url());
  });
  await page.route("**/api/**", (r) => r.abort());
  (page as unknown as { apiCalls: string[] }).apiCalls = apiCalls;
});
test.afterEach(async ({ page }) =>
  expect((page as unknown as { apiCalls: string[] }).apiCalls).toEqual([]),
);

test("dashboard, mobile navigation, themes, layout and console", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  await page.goto("/#/");
  await expect(
    page.getByRole("heading", { name: "Hôm nay, bạn muốn hiểu gì?" }),
  ).toBeVisible();
  await expect(page.getByText("Sắp có", { exact: true })).toHaveCount(4);
  await expect(page.locator(".lesson-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Chuyển sang giao diện tối" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Chuyển sang giao diện sáng" })
    .click();
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(hasOverflow).toBe(false);
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Mở điều hướng" }).click();
    await page.getByRole("link", { name: "Tiến độ của tôi" }).click();
    await expect(
      page.getByRole("heading", { name: "Tiến độ của tôi" }),
    ).toBeVisible();
    await page.goto("/#/");
  }
  await page.screenshot({
    path: `../docs/${info.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("notes, bookmarks, exercise drafts and self-assessment persist after reload", async ({
  page,
}, info) => {
  const note =
    "Kiểu tĩnh chọn thành viên; runtime chọn override. " + info.project.name;
  const draft =
    "public virtual void Speak() {} // bản nháp " + info.project.name;
  await page.goto("/#/lessons/oop-polymorphism/explain");
  await page.getByLabel("Điều bạn muốn ghi nhớ").fill(note);
  await page.getByRole("button", { name: "Lưu ghi chú", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu ghi chú");
  const bookmark = page.getByRole("button", { name: "Yêu thích", exact: true });
  if (await bookmark.count()) await bookmark.click();
  await page.getByRole("button", { name: "Bài tập thực hành" }).click();
  const exercise = page.locator(".exercise-card").first();
  await exercise.getByLabel("Lời giải & giải thích của bạn").fill(draft);
  for (const checkbox of await exercise.getByRole("checkbox").all())
    if (await checkbox.isChecked()) await checkbox.uncheck();
  await exercise
    .getByRole("button", { name: "Lưu bài làm", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Đã lưu bài làm");
  await page.reload();
  await expect(
    page
      .locator(".exercise-card")
      .first()
      .getByLabel("Lời giải & giải thích của bạn"),
  ).toHaveValue(draft);
  await expect(page.getByLabel("Điều bạn muốn ghi nhớ")).toHaveValue(note);
  await expect(
    page.getByRole("button", { name: "Đã yêu thích", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    exercise.getByRole("button", {
      name: "Xác nhận đã tự đánh giá",
      exact: true,
    }),
  ).toBeDisabled();
  await exercise.getByRole("button", { name: "Mở gợi ý 1/2" }).click();
  await expect(
    exercise.getByText("Lớp cha phải cho phép ghi đè."),
  ).toBeVisible();
  await exercise.getByRole("button", { name: "Xem đáp án tham khảo" }).click();
  await expect(
    exercise.getByRole("button", {
      name: "Xác nhận đã tự đánh giá",
      exact: true,
    }),
  ).toBeDisabled();
  for (const checkbox of await exercise.getByRole("checkbox").all())
    await checkbox.check();
  await exercise
    .getByRole("button", { name: "Xác nhận đã tự đánh giá", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Đã lưu tự đánh giá");
  await page.reload();
  await expect(
    exercise.getByRole("button", { name: "Đã lưu tự đánh giá", exact: true }),
  ).toBeVisible();
});
test("quiz wrong → review correct keeps history and does not leak feedback early", async ({
  page,
}) => {
  await page.goto("/#/lessons/oop-polymorphism/quiz");
  const card = page.locator('[data-question="oop-q-concept"]');
  await expect(card.locator(".quiz-feedback")).toHaveCount(0);
  await card.locator(".choice").nth(1).click();
  await card
    .getByRole("button", { name: "Gửi câu trả lời", exact: true })
    .click();
  await expect(card.locator(".quiz-feedback")).toContainText("Chưa chính xác");
  await expect(card.locator(".option-explanations li")).toHaveCount(3);
  await page.goto("/#/review");
  const review = page.locator('[data-question="oop-q-concept"]');
  await expect(review).toBeVisible();
  await expect(review.locator(".quiz-feedback")).toHaveCount(0);
  await review.locator(".choice").first().click();
  await review
    .getByRole("button", { name: "Gửi câu trả lời ôn tập", exact: true })
    .click();
  await expect(review.locator(".quiz-feedback")).toContainText("Chính xác");
  await review.getByText(/Lịch sử câu này/).click();
  await expect(review.locator(".attempt-history")).toContainText("Cần ôn");
  await expect(review.locator(".attempt-history")).toContainText("Đúng");
  await page.reload();
  await expect(page.locator('[data-question="oop-q-concept"]')).toHaveCount(0);
});
test("predictions gate expected results and SQL tables", async ({ page }) => {
  await page.goto("/#/lessons/linq-deferred/examples");
  const example = page.locator(".activity-card").first();
  await expect(example.getByText("Giải thích từng bước")).toHaveCount(0);
  await example.locator(".choice").nth(1).click();
  await example.getByRole("button", { name: "Gửi dự đoán" }).click();
  await expect(example.locator(".output")).toHaveText("2, 3");
  await page.goto("/#/lessons/sql-left-join/examples");
  const sql = page.locator(".activity-card").first();
  await sql.locator(".choice").nth(2).click();
  await sql.getByRole("button", { name: "Gửi dự đoán" }).click();
  await expect(sql.locator("tbody tr")).toHaveCount(3);
  await expect(sql.locator("tbody")).toContainText("Bình");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
test("search and combined topic, level and learning-status filters work", async ({
  page,
}) => {
  await page.goto("/#/lessons");
  await page
    .getByRole("textbox", { name: "Tìm bài học", exact: true })
    .fill("trì hoãn");
  // Search matches title, description, and tags. A term from the title has one result.
  await page
    .getByRole("textbox", { name: "Tìm bài học", exact: true })
    .fill("deferred");
  await expect(page.locator(".lesson-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Xóa bộ lọc", exact: true }).click();
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("sql");
  await page.getByLabel("Mức độ", { exact: true }).selectOption("Trung cấp");
  await expect(page.locator(".lesson-card")).toHaveCount(1);
  await page.getByLabel("Trạng thái", { exact: true }).selectOption("complete");
  await expect(page.locator(".lesson-card")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Xóa bộ lọc", exact: true })
    .first()
    .click();
  await expect(page.locator(".lesson-card")).toHaveCount(3);
  await page
    .getByRole("textbox", { name: "Tìm bài học", exact: true })
    .fill("da hinh");
  await expect(page.locator(".lesson-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Xóa bộ lọc", exact: true }).click();
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("csharp");
  await expect(
    page.getByRole("heading", { name: "Chủ đề này sắp có bài học" }),
  ).toBeVisible();
});
test("read flag, section resume, relevant anchors and history page", async ({
  page,
}) => {
  await page.goto("/#/lessons/linq-deferred/explain");
  const mark = page.getByRole("button", {
    name: "Đánh dấu đã đọc",
    exact: true,
  });
  if (await mark.count()) await mark.click();
  await page.getByRole("button", { name: "Câu hỏi ôn tập" }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await page.goto("/#/");
  await expect(
    page.getByRole("link", { name: "Tiếp tục học", exact: true }).first(),
  ).toHaveAttribute("href", /linq-deferred\/quiz/);
  await page.goto("/#/lessons/linq-deferred/quiz");
  const answered = page.locator('[data-question="linq-q-concept"]');
  await answered.locator(".choice").nth(1).click();
  await answered
    .getByRole("button", { name: "Gửi câu trả lời", exact: true })
    .click();
  await page.goto("/#/progress");
  await expect(page.locator(".history-panel tbody tr")).not.toHaveCount(0);
  await page.goto("/#/lessons/linq-deferred/explain#mechanism");
  await expect(page.locator("#mechanism")).toBeInViewport();
});
test("keyboard can operate radio choices and mobile menu closes with Escape", async ({
  page,
}, info) => {
  await page.goto("/#/lessons/linq-deferred/quiz");
  await expect(page.locator("h1")).toBeVisible();
  if (info.project.name === "mobile") {
    const menu = page.getByRole("button", { name: "Mở điều hướng" });
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
  }
  const card = page.locator('[data-question="linq-q-concept"]');
  const first = card.getByRole("radio").first();
  await first.focus();
  await page.keyboard.press("ArrowDown");
  await expect(card.getByRole("radio").nth(1)).toBeChecked();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(card.locator(".quiz-feedback")).toContainText("Chính xác");
});
