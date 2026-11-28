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

async function logoutThroughUi(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto("/auth");
}

test.describe("TOPIK Learner Audio Modes E2E", () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD || !LEARNER_EMAIL || !LEARNER_PASSWORD,
    "Set TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_LEARNER_EMAIL, TEST_LEARNER_PASSWORD before running.",
  );

  test("Learner can take a published exam in both practice (per-question) and exam (single-play) modes", async ({
    page,
  }) => {
    const examTitle = `E2E Learner Audio ${Date.now()}`;

    // 1. Admin creates a published exam with audio, image, category, and listening range
    await loginThroughUi(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/admin/topik/new");

    await page.getByLabel("Tên đề thi").fill(examTitle);
    await page.getByLabel("Trạng thái").selectOption("published");
    await page
      .locator('input[type="file"][accept*="audio"]')
      .setInputFiles(AUDIO_FIXTURE);
    await expect(page.locator("audio")).toBeVisible({ timeout: 20_000 });

    await page.getByLabel("Phần thi").selectOption("listening");
    await page.getByLabel("Nội dung câu hỏi").fill("다음을 듣고 고르십시오.");
    await page
      .getByLabel(
        "Kịch bản bài nghe (được đọc bằng giọng đọc của trình duyệt)",
      )
      .fill("남자: 안녕하세요?");
    await page
      .locator('input[type="file"][accept*="image"]')
      .setInputFiles(IMAGE_FIXTURE);
    await expect(page.locator('img[alt="Ảnh câu hỏi 1"]')).toBeVisible({
      timeout: 20_000,
    });
    await page.getByLabel("Dạng câu hỏi").fill("Chọn tranh");
    await page.getByLabel("Bắt đầu (giây)").fill("0.2");
    await page.getByLabel("Kết thúc (giây)").fill("1.5");

    for (let i = 1; i <= 4; i++) {
      await page.getByLabel(`Nội dung đáp án ${i}`).fill(`Lựa chọn ${i}`);
    }

    await page.getByRole("button", { name: "Lưu đề thi" }).click();
    await page.waitForURL("**/admin/topik");
    await expect(page.getByText(examTitle)).toBeVisible();

    await logoutThroughUi(page);

    // 2. Learner opens the exam and verifies Practice mode
    await loginThroughUi(page, LEARNER_EMAIL, LEARNER_PASSWORD);
    await page.goto("/topik");

    const examCard = page.locator("article", { hasText: examTitle });
    await examCard.locator('a[href^="/topik/"]').click();
    await page.waitForURL(/\/topik\/.+/);

    // Intro screen shows both audio modes with "Luyện từng câu" selected by default
    const practiceRadio = page.getByRole("radio", { name: /Luyện từng câu/i });
    const examRadio = page.getByRole("radio", { name: /Thi thử/i });
    await expect(practiceRadio).toBeChecked();
    await expect(examRadio).toBeVisible();

    await page.getByRole("button", { name: /Bắt đầu làm bài/i }).click();

    // Verify category badge, question image, and per-question range button
    await expect(page.getByText("Chọn tranh")).toBeVisible();
    await expect(page.locator('img[alt="Hình minh họa câu 1"]')).toBeVisible();

    const rangeBtn = page.getByRole("button", {
      name: /Nghe câu này \(0\.2s – 1\.5s\)/i,
    });
    await expect(rangeBtn).toBeVisible();
    await rangeBtn.click();
    await expect(page.getByRole("button", { name: "Dừng nghe" })).toBeVisible();

    // Submit in practice mode
    await page.getByRole("button", { name: "Nộp bài" }).first().click();
    const confirmDialog = page.getByRole("dialog", { name: "Nộp bài?" });
    if (await confirmDialog.isVisible().catch(() => false)) {
      await confirmDialog.getByRole("button", { name: "Nộp bài" }).click();
    }
    await expect(
      page.getByRole("heading", { name: "Xem lại bài làm" }),
    ).toBeVisible();

    // 3. Retry in Exam mode ("Thi thử (nghe 1 lần)")
    await page.goto("/topik");
    await examCard.locator('a[href^="/topik/"]').click();
    await examRadio.check();
    await page.getByRole("button", { name: /Bắt đầu làm bài/i }).click();

    await expect(
      page.getByText(/Chế độ thi thử — Audio chỉ phát 1 lần/i),
    ).toBeVisible();
    await expect(page.locator("audio[controls]")).toHaveCount(0);

    const startAudioBtn = page.getByRole("button", {
      name: /Bắt đầu phát audio/i,
    });
    await expect(startAudioBtn).toBeVisible();
    await startAudioBtn.click();
    await expect(
      page.getByRole("button", { name: /Tạm dừng|Đang phát/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Nộp bài" }).first().click();
    if (await confirmDialog.isVisible().catch(() => false)) {
      await confirmDialog.getByRole("button", { name: "Nộp bài" }).click();
    }
    await expect(
      page.getByRole("heading", { name: "Xem lại bài làm" }),
    ).toBeVisible();

    await logoutThroughUi(page);

    // 4. Clean up test exam as admin
    await loginThroughUi(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/admin/topik");
    const rowToDelete = page.locator("tr", { hasText: examTitle });
    await rowToDelete.getByRole("button", { name: "Xóa" }).click();
    await page.getByRole("button", { name: /Xóa/i }).last().click();
    await expect(page.getByText(examTitle)).toBeHidden();
  });
});
