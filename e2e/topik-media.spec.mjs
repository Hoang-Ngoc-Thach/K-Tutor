import { expect, test } from "@playwright/test";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIO_FIXTURE = join(__dirname, "fixtures", "test-audio.wav");
const IMAGE_FIXTURE = join(__dirname, "fixtures", "test-image.png");

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "";
const LEARNER_EMAIL = process.env.TEST_LEARNER_EMAIL || "";
const LEARNER_PASSWORD = process.env.TEST_LEARNER_PASSWORD || "";

async function loginThroughUi(page, email, password) {
  await page.goto("/auth");
  await page.getByPlaceholder("name@example.com").fill(email);
  await page.getByPlaceholder("Nhập mật khẩu của bạn").fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"));
}

test.describe("TOPIK Admin Audio & Image E2E", () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    "Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD before running.",
  );

  test("Create exam with audio, image, listening range, reload, remove audio, and verify learner flow", async ({
    page,
  }) => {
    const examTitle = `E2E TOPIK Media ${Date.now()}`;

    // 1. Login as admin and open new TOPIK exam editor
    await loginThroughUi(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/admin/topik/new");
    await expect(
      page.getByRole("heading", { name: "Thêm đề thi TOPIK" }),
    ).toBeVisible();

    // Fill exam info
    await page.getByLabel("Tên đề thi").fill(examTitle);
    await page.getByLabel("Kỳ thi / bộ đề").fill("E2E Test");

    // Upload exam audio
    const audioInput = page.locator('input[type="file"][accept*="audio"]');
    await audioInput.setInputFiles(AUDIO_FIXTURE);

    // Wait for audio player to appear
    const audioPlayer = page.locator("audio");
    await expect(audioPlayer).toBeVisible({ timeout: 20_000 });

    // 2. Configure Question 1 (listening) with image, category, start/end time
    await page.getByLabel("Phần thi").selectOption("listening");
    await page.getByLabel("Nội dung câu hỏi").fill("다음을 듣고 맞는 그림을 고르십시오.");
    await page.getByLabel("Kịch bản bài nghe (được đọc bằng giọng đọc của trình duyệt)").fill("남자: 안녕하세요?");

    // Upload question image
    const imageInput = page.locator('input[type="file"][accept*="image"]');
    await imageInput.setInputFiles(IMAGE_FIXTURE);
    await expect(page.locator('img[alt="Ảnh câu hỏi 1"]')).toBeVisible({
      timeout: 20_000,
    });

    // Category
    await page.getByLabel("Dạng câu hỏi").fill("Chọn tranh");

    // Start & end seconds + test range button
    await page.getByLabel("Bắt đầu (giây)").fill("0.2");
    await page.getByLabel("Kết thúc (giây)").fill("1.2");
    await page.getByRole("button", { name: "Nghe thử" }).click();

    // Fill 4 options and explanation
    for (let i = 1; i <= 4; i++) {
      await page
        .getByLabel(`Nội dung đáp án ${i}`)
        .fill(`Đáp án ${i}`);
    }
    await page
      .getByLabel("Giải thích đáp án (hiện sau khi học viên nộp bài)")
      .fill("Giải thích mẫu E2E");

    // 3. Save exam
    await page.getByRole("button", { name: "Lưu đề thi" }).click();
    await page.waitForURL("**/admin/topik");

    // 4. Re-open the created exam and verify data persisted after reload
    await expect(page.getByText(examTitle)).toBeVisible();
    const examRow = page.locator("tr", { hasText: examTitle });
    await examRow.getByRole("button", { name: "Chỉnh sửa" }).click();

    await page.waitForURL(/\/admin\/topik\/.+\/edit/);
    await page.reload();

    await expect(page.getByLabel("Tên đề thi")).toHaveValue(examTitle);
    await expect(page.locator("audio")).toBeVisible();
    await expect(page.locator('img[alt="Ảnh câu hỏi 1"]')).toBeVisible();
    await expect(page.getByLabel("Dạng câu hỏi")).toHaveValue("Chọn tranh");
    await expect(page.getByLabel("Bắt đầu (giây)")).toHaveValue("0.2");
    await expect(page.getByLabel("Kết thúc (giây)")).toHaveValue("1.2");

    // 5. Remove audio and save
    await page.getByRole("button", { name: "Xóa audio" }).click();
    await expect(page.locator("audio")).toBeHidden();
    await page.getByRole("button", { name: "Lưu đề thi" }).click();
    await page.waitForURL("**/admin/topik");

    // Clean up test exam so it doesn't clutter DB
    const rowToDelete = page.locator("tr", { hasText: examTitle });
    await rowToDelete.getByRole("button", { name: "Xóa" }).click();
    await page.getByRole("button", { name: /Xóa/i }).last().click();
    await expect(page.getByText(examTitle)).toBeHidden();
  });

  test("Learner can still open and submit an existing published exam", async ({
    page,
  }) => {
    test.skip(
      !LEARNER_EMAIL || !LEARNER_PASSWORD,
      "Set TEST_LEARNER_EMAIL and TEST_LEARNER_PASSWORD to run learner test.",
    );

    await loginThroughUi(page, LEARNER_EMAIL, LEARNER_PASSWORD);
    await page.goto("/topik");

    const firstStartLink = page.locator('a[href^="/topik/"]').first();
    await expect(firstStartLink).toBeVisible();
    await firstStartLink.click();

    await page.getByRole("button", { name: /Bắt đầu làm bài/i }).click();
    await page.getByRole("button", { name: /Nộp bài/i }).click();

    // Confirm modal if present, then check result screen
    const confirmDialog = page.getByRole("dialog", { name: "Nộp bài?" });
    if (await confirmDialog.isVisible().catch(() => false)) {
      await confirmDialog.getByRole("button", { name: "Nộp bài" }).click();
    }
    await expect(
      page.getByRole("heading", { name: "Xem lại bài làm" }),
    ).toBeVisible();
  });
});
