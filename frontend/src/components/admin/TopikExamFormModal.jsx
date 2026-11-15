import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { getTopikErrorMessage } from "../../api/topikExams";
import {
  OPTION_MARKS,
  SECTIONS,
  TOPIK_LEVELS,
  emptyQuestion,
} from "../user/topik/topikUtils";

// Render có điều kiện từ trang cha ({exam && <TopikExamFormModal ... />})
// nên state form luôn được khởi tạo lại mỗi lần mở.
// onSave phải trả về Promise; nếu ném lỗi, modal giữ nguyên và hiện thông báo.
export default function TopikExamFormModal({ exam, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...exam,
    round: exam.round ?? "",
    description: exam.description ?? "",
    questions: exam.questions.map((question) => ({
      ...question,
      options: [...question.options],
    })),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateQuestion = (index, changes) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) =>
        i === index ? { ...question, ...changes } : question,
      ),
    }));

  const updateOption = (questionIndex, optionIndex, value) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) =>
        i === questionIndex
          ? {
              ...question,
              options: question.options.map((option, j) =>
                j === optionIndex ? value : option,
              ),
            }
          : question,
      ),
    }));

  const addQuestion = () =>
    setForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        emptyQuestion(prev.questions.at(-1)?.section),
      ],
    }));

  const removeQuestion = (index) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));

  // Trả về thông báo lỗi đầu tiên tìm thấy, hoặc chuỗi rỗng nếu hợp lệ.
  function validate() {
    if (!form.title.trim()) return "Vui lòng nhập tên đề thi.";
    if (form.questions.length === 0) return "Đề thi cần ít nhất 1 câu hỏi.";

    for (const [index, question] of form.questions.entries()) {
      const label = `Câu ${index + 1}`;
      if (!question.text.trim()) return `${label}: chưa nhập nội dung câu hỏi.`;
      if (question.options.some((option) => !option.trim())) {
        return `${label}: cần nhập đủ 4 đáp án.`;
      }
      const unique = new Set(question.options.map((option) => option.trim()));
      if (unique.size < question.options.length) {
        return `${label}: các đáp án không được trùng nhau.`;
      }
      if (question.section === "listening" && !question.script.trim()) {
        return `${label}: câu nghe cần có kịch bản bài nghe.`;
      }
    }
    return "";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        id: form.id,
        title: form.title.trim(),
        level: form.level,
        year: Number(form.year) || new Date().getFullYear(),
        round: form.round.trim(),
        durationMinutes: Math.max(1, Number(form.durationMinutes) || 1),
        status: form.status,
        description: form.description.trim(),
        questions: form.questions.map((question) => ({
          id: question.id,
          section: question.section,
          text: question.text.trim(),
          passage: question.passage.trim(),
          script:
            question.section === "listening" ? question.script.trim() : "",
          options: question.options.map((option) => option.trim()),
          answerIndex: question.answerIndex,
          explanation: question.explanation.trim(),
        })),
      });
    } catch (err) {
      setError(getTopikErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4 backdrop-blur-[2px]">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {form.id ? "Chỉnh sửa đề thi" : "Thêm đề thi TOPIK"}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Nhập thông tin đề, sau đó soạn từng câu hỏi trắc nghiệm 4 đáp án
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-5">
            {/* Thông tin đề */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <Field label="Tên đề thi">
                  <input
                    required
                    type="text"
                    maxLength={150}
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ví dụ: Đề thử TOPIK I - Bộ 3"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Cấp">
                  <select
                    value={form.level}
                    onChange={(e) => handleChange("level", e.target.value)}
                    className={inputClass}
                  >
                    {TOPIK_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Năm">
                  <input
                    required
                    type="number"
                    min="2000"
                    max="2100"
                    value={form.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Kỳ thi / bộ đề">
                  <input
                    type="text"
                    maxLength={50}
                    value={form.round}
                    onChange={(e) => handleChange("round", e.target.value)}
                    placeholder="Ví dụ: Kỳ 91"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="sm:col-span-3">
                <Field label="Thời gian làm bài (phút)">
                  <input
                    required
                    type="number"
                    min="1"
                    max="300"
                    value={form.durationMinutes}
                    onChange={(e) =>
                      handleChange("durationMinutes", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="sm:col-span-3">
                <Field label="Trạng thái">
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className={inputClass}
                  >
                    <option value="draft">Bản nháp (học viên chưa thấy)</option>
                    <option value="published">
                      Xuất bản (học viên có thể làm)
                    </option>
                  </select>
                </Field>
              </div>

              <div className="sm:col-span-6">
                <Field label="Mô tả">
                  <textarea
                    maxLength={500}
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Mô tả ngắn về nội dung đề (không bắt buộc)"
                    className={textareaClass}
                  />
                </Field>
              </div>
            </section>

            {/* Câu hỏi */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Câu hỏi ({form.questions.length})
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm câu hỏi
                </button>
              </div>

              {form.questions.length === 0 && (
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-xs text-gray-400">
                  Chưa có câu hỏi nào. Bấm "Thêm câu hỏi" để bắt đầu soạn.
                </p>
              )}

              <div className="space-y-4">
                {form.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50/40 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-emerald-800 px-2.5 py-1 text-[11px] font-bold text-white">
                        Câu {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Kỹ năng câu ${index + 1}`}
                          value={question.section}
                          onChange={(e) =>
                            updateQuestion(index, { section: e.target.value })
                          }
                          className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500"
                        >
                          {SECTIONS.map((section) => (
                            <option key={section.value} value={section.value}>
                              {section.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          aria-label={`Xóa câu ${index + 1}`}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Field label="Nội dung câu hỏi">
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(index, { text: e.target.value })
                          }
                          placeholder="Ví dụ: 다음 ( )에 들어갈 말로 알맞은 것을 고르십시오."
                          className={inputClass}
                        />
                      </Field>

                      {question.section === "listening" ? (
                        <Field label="Kịch bản bài nghe (được đọc bằng giọng đọc của trình duyệt)">
                          <textarea
                            rows={2}
                            value={question.script}
                            onChange={(e) =>
                              updateQuestion(index, { script: e.target.value })
                            }
                            placeholder="남자: 안녕하세요? 여자: 안녕하세요."
                            className={textareaClass}
                          />
                        </Field>
                      ) : (
                        <Field label="Đoạn văn / câu đề (không bắt buộc)">
                          <textarea
                            rows={2}
                            value={question.passage}
                            onChange={(e) =>
                              updateQuestion(index, { passage: e.target.value })
                            }
                            placeholder="Nhập đoạn văn hoặc câu có chỗ trống ( )"
                            className={textareaClass}
                          />
                        </Field>
                      )}

                      <fieldset>
                        <legend className="mb-2 text-xs font-semibold text-gray-700">
                          Đáp án (chọn nút tròn ở đáp án đúng)
                        </legend>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {question.options.map((option, optionIndex) => (
                            <label
                              key={optionIndex}
                              className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 ${
                                question.answerIndex === optionIndex
                                  ? "border-emerald-500 ring-2 ring-emerald-100"
                                  : "border-gray-200"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`answer-${question.id}`}
                                checked={question.answerIndex === optionIndex}
                                onChange={() =>
                                  updateQuestion(index, {
                                    answerIndex: optionIndex,
                                  })
                                }
                                aria-label={`Đáp án ${optionIndex + 1} là đáp án đúng`}
                                className="h-4 w-4 accent-emerald-600"
                              />
                              <span className="text-sm font-semibold text-gray-400">
                                {OPTION_MARKS[optionIndex]}
                              </span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  updateOption(
                                    index,
                                    optionIndex,
                                    e.target.value,
                                  )
                                }
                                aria-label={`Nội dung đáp án ${optionIndex + 1}`}
                                className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none"
                              />
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <Field label="Giải thích đáp án (hiện sau khi học viên nộp bài)">
                        <textarea
                          rows={2}
                          value={question.explanation}
                          onChange={(e) =>
                            updateQuestion(index, {
                              explanation: e.target.value,
                            })
                          }
                          className={textareaClass}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            <p role="alert" className="min-w-0 flex-1 text-xs text-red-600">
              {error}
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Đang lưu..."
                  : form.id
                    ? "Lưu thay đổi"
                    : "Thêm đề thi"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {children}
      </label>
    </div>
  );
}

const inputClass =
  "mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-normal text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const textareaClass =
  "mt-1.5 w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-normal text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
