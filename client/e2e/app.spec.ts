import { test, expect } from "@playwright/test";
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
test("simple library, visible navigation, theme, responsive layout and console", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  await page.goto("/#/");
  await expect(page.locator("h1")).toContainText("Học điều mới.");
  await expect(page.locator(".lesson-row")).toHaveCount(43);
  await page.getByRole("button", { name: "Chuyển sang giao diện tối" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Chuyển sang giao diện sáng" })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.screenshot({
    path: `../docs/${info.project.name}.png`,
    fullPage: false,
  });
  await page
    .getByRole("navigation", { name: "Điều hướng chính" })
    .getByRole("link", { name: "Ôn lại" })
    .click();
  await expect(page.locator("h1")).toHaveText("Ôn lại kiến thức");
  expect(errors).toEqual([]);
});
test("beginner path, definitions, quick recap and web input/files", async ({
  page,
}, info) => {
  await page.goto("/#/");
  await page.getByRole("link", { name: "Tôi muốn học từ đầu" }).click();
  await expect(page).toHaveURL(/dotnet-first-program\/explain/);
  await expect(
    page.getByRole("heading", { name: "Nền tảng trước khi đọc code" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ôn nhanh", exact: true }).click();
  await expect(page.locator(".recap-box")).toBeVisible();
  await expect(page.locator(".knowledge-section")).toHaveCount(0);
  await page.goto("/#/lessons/mvc-views/explain");
  await expect(page.locator(".request-fixture").first()).toContainText(
    "GET http://localhost:5090/",
  );
  await expect(page.locator(".fixture-file").first()).toContainText(
    "Views/Home/Index.cshtml",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.screenshot({
    path: `../docs/lesson-${info.project.name}.png`,
    fullPage: false,
  });
  await page.goto("/#/lessons/design-testing-patterns/explain#testing");
  await expect(page.locator("#testing")).toBeInViewport();
  await expect(page.locator("#testing .code-block")).toContainText(
    "3 ca kiểm tra đạt",
  );
});
test("notes, bookmark, draft and self assessment persist", async ({ page }) => {
  await page.goto("/#/lessons/oop-polymorphism/explain");
  await page.locator(".personal-notes > summary").click();
  await page
    .getByLabel("Điều bạn muốn ghi nhớ")
    .fill("Hiểu kiểu tĩnh và runtime");
  await page.getByRole("button", { name: "Lưu ghi chú", exact: true }).click();
  await page.getByRole("button", { name: "Yêu thích", exact: true }).click();
  await page.getByRole("link", { name: "Thực hành", exact: true }).click();
  const ex = page.locator(".exercise-card").first();
  await ex.getByLabel("Lời giải & giải thích của bạn").fill("my draft");
  await ex.getByRole("button", { name: "Lưu bài làm", exact: true }).click();
  await page.reload();
  await expect(ex.getByLabel("Lời giải & giải thích của bạn")).toHaveValue(
    "my draft",
  );
  await expect(page.getByLabel("Điều bạn muốn ghi nhớ")).toHaveValue(
    "Hiểu kiểu tĩnh và runtime",
  );
  await expect(
    page.getByRole("button", { name: "Đã yêu thích" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    ex.getByRole("button", { name: "Xác nhận đã tự đánh giá", exact: true }),
  ).toBeDisabled();
  await ex.getByRole("button", { name: "Mở gợi ý 1/2" }).click();
  await ex.getByRole("button", { name: "Xem đáp án tham khảo" }).click();
  await expect(
    ex.getByRole("button", { name: "Xác nhận đã tự đánh giá", exact: true }),
  ).toBeDisabled();
  for (const check of await ex.getByRole("checkbox").all()) await check.check();
  await ex
    .getByRole("button", { name: "Xác nhận đã tự đánh giá", exact: true })
    .click();
  await page.reload();
  await expect(
    ex.getByRole("button", { name: "Đã lưu tự đánh giá", exact: true }),
  ).toBeVisible();
});
test("wrong answer then review correct retains both attempts", async ({
  page,
}) => {
  await page.goto("/#/lessons/oop-polymorphism/quiz");
  const card = page.locator('[data-question="oop-q-concept"]');
  await expect(card.locator(".quiz-feedback")).toHaveCount(0);
  await card.getByRole("radio").nth(1).check();
  await card
    .getByRole("button", { name: "Gửi câu trả lời", exact: true })
    .click();
  await expect(card.locator(".option-explanations li")).toHaveCount(3);
  await page.goto("/#/review");
  const review = page.locator('[data-question="oop-q-concept"]');
  await expect(review).toBeVisible();
  await expect(review.locator(".quiz-feedback")).toHaveCount(0);
  await review.getByRole("radio").first().check();
  await review
    .getByRole("button", { name: "Gửi câu trả lời ôn tập", exact: true })
    .click();
  await review.getByText(/Lịch sử câu này/).click();
  await expect(review.locator(".attempt-history")).toContainText("Cần ôn");
  await expect(review.locator(".attempt-history")).toContainText("Đúng");
  await page.reload();
  await expect(page.locator('[data-question="oop-q-concept"]')).toHaveCount(0);
});
test("predictions gate expected output and SQL result table", async ({
  page,
}) => {
  await page.goto("/#/lessons/linq-deferred/examples");
  const example = page.locator(".activity-card").first();
  await expect(example.locator(".example-result")).toHaveCount(0);
  await example.getByRole("radio").nth(1).check();
  await example.getByRole("button", { name: "Gửi dự đoán" }).click();
  await expect(example.locator(".output")).toHaveText("2, 3");
  await page.goto("/#/lessons/sql-left-join/examples");
  const sql = page.locator(".activity-card").first();
  await sql.getByRole("radio").nth(2).check();
  await sql.getByRole("button", { name: "Gửi dự đoán" }).click();
  await expect(sql.locator("tbody tr")).toHaveCount(3);
  await expect(sql.locator("tbody")).toContainText("Bình");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
test("accent-insensitive search, combined topic and saved filters", async ({
  page,
}) => {
  await page.goto("/#/");
  await page.getByLabel("Tìm bài học", { exact: true }).fill("da hinh");
  await expect(page.locator(".lesson-row")).toHaveCount(1);
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("sql");
  await expect(page.locator(".lesson-row")).toHaveCount(0);
  await page.getByRole("button", { name: "Xóa bộ lọc", exact: true }).click();
  await expect(page.locator(".lesson-row")).toHaveCount(43);
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("efcore");
  await expect(page.locator(".lesson-row")).toHaveCount(3);
  await page.locator(".lesson-row").first().getByRole("button").click();
  await page.getByRole("button", { name: "Đã lưu", exact: true }).click();
  await expect(page.locator(".lesson-row")).toHaveCount(1);
});
test("read flag, resume, anchors and keyboard quiz", async ({ page }) => {
  await page.goto("/#/lessons/linq-deferred/explain");
  await page
    .getByRole("button", { name: "Đánh dấu đã đọc", exact: true })
    .click();
  await page.getByRole("link", { name: "Tự kiểm tra", exact: true }).click();
  await page.goto("/#/");
  await expect(
    page.getByRole("link", { name: "Tiếp tục học", exact: true }),
  ).toHaveAttribute("href", /linq-deferred\/quiz/);
  await page.goto("/#/lessons/linq-deferred/quiz");
  const card = page.locator('[data-question="linq-q-concept"]');
  await card.getByRole("radio").first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(card.getByRole("radio").nth(1)).toBeChecked();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(card.locator(".quiz-feedback")).toContainText("Chính xác");
  await card.getByRole("link", { name: "Đọc lại phần liên quan" }).click();
  await expect(page.locator("#mechanism")).toBeInViewport();
});
