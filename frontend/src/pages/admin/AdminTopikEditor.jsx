import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  createTopikExamRequest,
  getTopikErrorMessage,
  getTopikExamRequest,
  updateTopikExamRequest,
} from "../../api/topikExams";
import {
  emptyQuestion,
  OPTION_MARKS,
  SECTIONS,
  TOPIK_LEVELS,
  validateTopikExam,
} from "../../components/user/topik/topikUtils";
import AdminSidebar from "../../layout/admin/AdminSidebar";

function createEmptyExam() {
  return {
    title: "",
    level: TOPIK_LEVELS[0],
    year: String(new Date().getFullYear()),
    round: "",
    durationMinutes: "40",
    status: "draft",
    description: "",
    questions: [emptyQuestion()],
  };
}

function toEditorForm(exam) {
  return {
    id: exam.id,
    title: exam.title ?? "",
    level: exam.level ?? TOPIK_LEVELS[0],
    year: String(exam.year ?? new Date().getFullYear()),
    round: exam.round ?? "",
    durationMinutes: String(exam.durationMinutes ?? 40),
    status: exam.status ?? "draft",
    description: exam.description ?? "",
    questions: Array.isArray(exam.questions)
      ? exam.questions.map((question) => ({
          ...question,
          id: question.id ?? emptyQuestion(question.section).id,
          text: question.text ?? "",
          passage: question.passage ?? "",
          script: question.script ?? "",
          options: Array.isArray(question.options)
            ? [...question.options]
            : ["", "", "", ""],
          answerIndex: question.answerIndex ?? 0,
          explanation: question.explanation ?? "",
        }))
      : [],
  };
}

export default function AdminTopikEditor() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(createEmptyExam);
  const [loadedExamId, setLoadedExamId] = useState(null);
  const [loadErrorState, setLoadErrorState] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const questionEditorRef = useRef(null);
  const loadError =
    loadErrorState && loadErrorState.examId === examId
      ? loadErrorState.message
      : "";
  const isLoading =
    Boolean(examId) && loadedExamId !== examId && !loadError;

  useEffect(() => {
    if (!examId) return undefined;

    let active = true;

    getTopikExamRequest(examId)
      .then((exam) => {
        if (!active) return;
        if (!exam) {
          setLoadErrorState({
            examId,
            message: "Không tìm thấy đề thi.",
          });
          return;
        }
        setForm(toEditorForm(exam));
        setLoadedExamId(examId);
        setIsDirty(false);
        setHasValidated(false);
        setCurrentQuestionIndex(0);
      })
      .catch((error) => {
        if (active) {
          setLoadErrorState({
            examId,
            message: getTopikErrorMessage(error),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [examId]);

  useEffect(() => {
    if (!isDirty) return undefined;

    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (currentQuestionIndex >= 0) {
      questionEditorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentQuestionIndex]);

  const validation = useMemo(
    () => (hasValidated ? validateTopikExam(form) : null),
    [form, hasValidated],
  );
  const questionsBySection = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        questions: form.questions
          .map((question, index) => ({ question, index }))
          .filter(({ question }) => question.section === section.value),
      })),
    [form.questions],
  );
  const currentQuestion = form.questions[currentQuestionIndex] ?? null;

  function markChanged() {
    setIsDirty(true);
    setSaveError("");
  }

  function updateExamField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    markChanged();
  }

  function updateQuestion(index, changes) {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...changes } : question,
      ),
    }));
    markChanged();
  }

  function updateOption(questionIndex, optionIndex, value) {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? value : option,
              ),
            }
          : question,
      ),
    }));
    markChanged();
  }

  function addQuestion() {
    const newIndex = form.questions.length;
    setForm((previous) => ({
      ...previous,
      questions: [
        ...previous.questions,
        emptyQuestion(previous.questions.at(-1)?.section),
      ],
    }));
    setCurrentQuestionIndex(newIndex);
    markChanged();
  }

  function duplicateQuestion() {
    if (!currentQuestion) return;
    const duplicateId = emptyQuestion(currentQuestion.section).id;
    const duplicate = {
      ...currentQuestion,
      id: duplicateId,
      options: [...currentQuestion.options],
    };
    const nextQuestions = [...form.questions];
    nextQuestions.splice(currentQuestionIndex + 1, 0, duplicate);
    setForm((previous) => ({ ...previous, questions: nextQuestions }));
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    markChanged();
  }

  function removeQuestion() {
    if (!currentQuestion) return;
    const nextQuestions = form.questions.filter(
      (_, index) => index !== currentQuestionIndex,
    );
    setForm((previous) => ({ ...previous, questions: nextQuestions }));
    setCurrentQuestionIndex(
      Math.min(currentQuestionIndex, Math.max(0, nextQuestions.length - 1)),
    );
    markChanged();
  }

  function requestLeave(event) {
    event?.preventDefault();
    if (isSaving) return;
    if (
      isDirty &&
      !window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?")
    ) {
      return;
    }
    navigate("/admin/topik");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving) return;

    setHasValidated(true);
    const result = validateTopikExam(form);
    if (!result.isValid) {
      const firstInvalidQuestion = result.errors.find(
        (error) => error.questionIndex !== null,
      );
      if (firstInvalidQuestion) {
        setCurrentQuestionIndex(firstInvalidQuestion.questionIndex);
      }
      return;
    }

    const payload = {
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
    };

    setIsSaving(true);
    setSaveError("");
    try {
      if (examId) {
        await updateTopikExamRequest(examId, payload);
      } else {
        await createTopikExamRequest(payload);
      }
      setIsDirty(false);
      navigate("/admin/topik");
    } catch (error) {
      setSaveError(getTopikErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50/60">
        <div className="hidden md:block">
          <AdminSidebar />
        </div>
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <p className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
            Đang tải...
          </p>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen bg-gray-50/60">
        <div className="hidden md:block">
          <AdminSidebar />
        </div>
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
            <p role="alert" className="text-sm text-red-700">
              {loadError}
            </p>
            <Link
              to="/admin/topik"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Về danh sách đề
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/60">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7">
        <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Link
              to="/admin/topik"
              onClick={requestLeave}
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-emerald-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách đề
            </Link>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-xl font-black tracking-tight text-gray-900 md:text-2xl">
                {examId ? "Sửa đề thi TOPIK" : "Thêm đề thi TOPIK"}
              </h1>
              <span className="text-xs font-medium text-gray-500">
                {form.questions.length} câu hỏi
              </span>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={requestLeave}
              disabled={isSaving}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="topik-exam-editor"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Đang lưu..." : "Lưu đề thi"}
            </button>
          </div>
        </header>

        {validation?.errors.length > 0 && (
          <section
            role="alert"
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <h2 className="text-sm font-bold text-red-800">
              Vui lòng sửa các lỗi sau ({validation.errors.length}):
            </h2>
            <ul className="mt-2 max-h-40 list-inside list-disc space-y-1 overflow-y-auto text-xs text-red-700">
              {validation.errors.map((error, index) => (
                <li key={`${error.message}-${index}`}>
                  {error.questionIndex === null ? (
                    error.message
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentQuestionIndex(error.questionIndex)
                      }
                      className="text-left underline decoration-red-300 underline-offset-2 hover:text-red-900"
                    >
                      {error.message}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {saveError && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"
          >
            {saveError}
          </p>
        )}

        <form
          id="topik-exam-editor"
          onSubmit={handleSubmit}
          noValidate
          className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[320px_minmax(0,1fr)]"
        >
          <aside className="space-y-4 xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-gray-900">
                Thông tin đề thi
              </h2>
              <div className="space-y-3">
                <Field label="Tên đề thi">
                  <input
                    type="text"
                    maxLength={150}
                    value={form.title}
                    onChange={(event) =>
                      updateExamField("title", event.target.value)
                    }
                    placeholder="Ví dụ: Đề thử TOPIK I - Bộ 3"
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cấp">
                    <select
                      value={form.level}
                      onChange={(event) =>
                        updateExamField("level", event.target.value)
                      }
                      className={inputClass}
                    >
                      {TOPIK_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Năm">
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={form.year}
                      onChange={(event) =>
                        updateExamField("year", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Kỳ thi / bộ đề">
                  <input
                    type="text"
                    maxLength={50}
                    value={form.round}
                    onChange={(event) =>
                      updateExamField("round", event.target.value)
                    }
                    placeholder="Ví dụ: Kỳ 91"
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Thời gian (phút)">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={form.durationMinutes}
                      onChange={(event) =>
                        updateExamField("durationMinutes", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Trạng thái">
                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateExamField("status", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="draft">
                        Bản nháp (học viên chưa thấy)
                      </option>
                      <option value="published">
                        Xuất bản (học viên có thể làm)
                      </option>
                    </select>
                  </Field>
                </div>

                <Field label="Mô tả">
                  <textarea
                    maxLength={500}
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      updateExamField("description", event.target.value)
                    }
                    placeholder="Mô tả ngắn về nội dung đề (không bắt buộc)"
                    className={textareaClass}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-gray-900">
                  Danh sách câu hỏi
                </h2>
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500">
                  {form.questions.length}
                </span>
              </div>

              <div className="space-y-4">
                {questionsBySection.map((section) => (
                  <section key={section.value}>
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      {section.label} ({section.questions.length})
                    </h3>
                    {section.questions.length === 0 ? (
                      <p className="text-xs text-gray-400">Chưa có câu hỏi.</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {section.questions.map(({ index }) => {
                          const isCurrent = currentQuestionIndex === index;
                          const hasErrors =
                            (validation?.questionErrors[index]?.length ?? 0) >
                            0;
                          return (
                            <button
                              key={form.questions[index].id}
                              type="button"
                              onClick={() => setCurrentQuestionIndex(index)}
                              aria-label={`Câu ${index + 1}, ${section.label}${
                                hasErrors ? ", có lỗi" : ""
                              }`}
                              aria-current={isCurrent ? "step" : undefined}
                              aria-invalid={hasErrors}
                              className={`relative rounded-xl border px-2 py-2.5 text-xs font-bold transition ${
                                hasErrors
                                  ? "border-red-300 bg-red-50 text-red-700"
                                  : isCurrent
                                    ? "border-emerald-700 bg-emerald-800 text-white"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-800"
                              } ${isCurrent && hasErrors ? "ring-2 ring-emerald-500 ring-offset-1" : ""}`}
                            >
                              {index + 1}
                              {hasErrors && (
                                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
              >
                <Plus className="h-4 w-4" />
                Thêm câu hỏi
              </button>
            </section>
          </aside>

          <section
            ref={questionEditorRef}
            className="min-w-0 scroll-mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-7"
          >
            {currentQuestion ? (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      Câu hỏi {currentQuestionIndex + 1} /{" "}
                      {form.questions.length}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      Nội dung câu hỏi
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={duplicateQuestion}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Nhân bản
                    </button>
                    <button
                      type="button"
                      onClick={removeQuestion}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa câu
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <Field label="Phần thi">
                    <select
                      value={currentQuestion.section}
                      onChange={(event) =>
                        updateQuestion(currentQuestionIndex, {
                          section: event.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      {SECTIONS.map((section) => (
                        <option key={section.value} value={section.value}>
                          {section.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Nội dung câu hỏi">
                    <textarea
                      rows={4}
                      value={currentQuestion.text}
                      onChange={(event) =>
                        updateQuestion(currentQuestionIndex, {
                          text: event.target.value,
                        })
                      }
                      placeholder="Ví dụ: 다음 ( )에 들어갈 말로 알맞은 것을 고르십시오."
                      className={textareaClass}
                    />
                  </Field>

                  {currentQuestion.section === "listening" ? (
                    <Field label="Kịch bản bài nghe (được đọc bằng giọng đọc của trình duyệt)">
                      <textarea
                        rows={7}
                        value={currentQuestion.script}
                        onChange={(event) =>
                          updateQuestion(currentQuestionIndex, {
                            script: event.target.value,
                          })
                        }
                        placeholder="남자: 안녕하세요? 여자: 안녕하세요."
                        className={textareaClass}
                      />
                    </Field>
                  ) : (
                    <Field label="Đoạn văn / câu đề (không bắt buộc)">
                      <textarea
                        rows={7}
                        value={currentQuestion.passage}
                        onChange={(event) =>
                          updateQuestion(currentQuestionIndex, {
                            passage: event.target.value,
                          })
                        }
                        placeholder="Nhập đoạn văn hoặc câu có chỗ trống ( )"
                        className={textareaClass}
                      />
                    </Field>
                  )}

                  <fieldset>
                    <legend className="mb-3 text-xs font-semibold text-gray-700">
                      Đáp án (chọn nút tròn ở đáp án đúng)
                    </legend>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {currentQuestion.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 py-3 ${
                            currentQuestion.answerIndex === optionIndex
                              ? "border-emerald-500 ring-2 ring-emerald-100"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`answer-${currentQuestion.id}`}
                            checked={
                              currentQuestion.answerIndex === optionIndex
                            }
                            onChange={() =>
                              updateQuestion(currentQuestionIndex, {
                                answerIndex: optionIndex,
                              })
                            }
                            aria-label={`Đáp án ${optionIndex + 1} là đáp án đúng`}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <span className="text-sm font-bold text-gray-400">
                            {OPTION_MARKS[optionIndex]}
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(event) =>
                              updateOption(
                                currentQuestionIndex,
                                optionIndex,
                                event.target.value,
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
                      rows={5}
                      value={currentQuestion.explanation}
                      onChange={(event) =>
                        updateQuestion(currentQuestionIndex, {
                          explanation: event.target.value,
                        })
                      }
                      className={textareaClass}
                    />
                  </Field>

                  {validation?.questionErrors[currentQuestionIndex]?.length >
                    0 && (
                    <ul className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                      {validation.questionErrors[currentQuestionIndex].map(
                        (error) => (
                          <li key={error}>{error}</li>
                        ),
                      )}
                    </ul>
                  )}
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((index) => Math.max(0, index - 1))
                    }
                    disabled={currentQuestionIndex === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Câu trước
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((index) =>
                        Math.min(form.questions.length - 1, index + 1),
                      )
                    }
                    disabled={
                      currentQuestionIndex >= form.questions.length - 1
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Câu tiếp
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-gray-600">
                  Đề thi chưa có câu hỏi.
                </p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-900"
                >
                  <Plus className="h-4 w-4" />
                  Thêm câu hỏi
                </button>
              </div>
            )}
          </section>
        </form>
        </div>
      </main>
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
  "mt-1.5 w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-normal text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
