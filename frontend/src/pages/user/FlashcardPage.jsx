import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
} from "lucide-react";
import {
  getVocabulariesRequest,
  getVocabularyErrorMessage,
} from "../../api/vocabularies";
import useSpeak from "../../hooks/useSpeak";

export default function FlashcardPage() {
  const { topicId } = useParams();
  const [vocabularies, setVocabularies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [ratings, setRatings] = useState({});
  const [reviewOnly, setReviewOnly] = useState(false);
  const [reviewIds, setReviewIds] = useState([]);
  const [voiceNoticeId, setVoiceNoticeId] = useState("");
  const { speak, available: speechAvailable } = useSpeak();

  useEffect(() => {
    let active = true;

    async function loadVocabularies() {
      setIsLoading(true);
      setErrorMessage("");
      setVocabularies([]);
      setRatings({});
      setFinished(false);
      setReviewOnly(false);
      setReviewIds([]);
      setCardIndex(0);
      setIsFlipped(false);
      try {
        const result = await getVocabulariesRequest(topicId);
        if (active) setVocabularies(Array.isArray(result) ? result : []);
      } catch (error) {
        if (active) setErrorMessage(getVocabularyErrorMessage(error));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadVocabularies();
    return () => {
      active = false;
    };
  }, [topicId]);

  const studyCards = useMemo(
    () =>
      reviewOnly
        ? vocabularies.filter((vocabulary) => reviewIds.includes(vocabulary.id))
        : vocabularies,
    [reviewIds, reviewOnly, vocabularies],
  );
  const currentVocabulary = studyCards[cardIndex];
  const rememberedCount = Object.values(ratings).filter(
    (rating) => rating === "remembered",
  ).length;
  const reviewCount = Object.values(ratings).filter(
    (rating) => rating === "review",
  ).length;

  const showNextCard = useCallback(() => {
    setIsFlipped(false);
    if (cardIndex >= studyCards.length - 1) {
      setFinished(true);
      return;
    }
    setCardIndex((index) => index + 1);
  }, [cardIndex, studyCards.length]);

  const showPreviousCard = useCallback(() => {
    if (cardIndex === 0) return;
    setCardIndex((index) => index - 1);
    setIsFlipped(false);
  }, [cardIndex]);

  const rateCurrentCard = useCallback(
    (rating) => {
      if (!currentVocabulary) return;
      setRatings((currentRatings) => ({
        ...currentRatings,
        [currentVocabulary.id]: rating,
      }));
      showNextCard();
    },
    [currentVocabulary, showNextCard],
  );

  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']");
      if (isEditable) {
        return;
      }

      if (event.code === "Space") {
        if (target instanceof HTMLElement && target.closest("button, a")) {
          return;
        }
        event.preventDefault();
        setIsFlipped((flipped) => !flipped);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousCard();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextCard();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showNextCard, showPreviousCard]);

  function restartReview() {
    setReviewIds(
      vocabularies
        .filter((vocabulary) => ratings[vocabulary.id] === "review")
        .map((vocabulary) => vocabulary.id),
    );
    setReviewOnly(true);
    setCardIndex(0);
    setFinished(false);
    setIsFlipped(false);
  }

  function resetStudy() {
    setReviewOnly(false);
    setCardIndex(0);
    setFinished(false);
    setIsFlipped(false);
  }

  const goBack = (
    <Link
      to="/topics"
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-700"
    >
      <ArrowLeft className="h-4 w-4" />
      Về danh sách chủ đề
    </Link>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 md:px-6">
      <div className="mb-6">{goBack}</div>

      {isLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Đang tải...
        </p>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-red-100 bg-white p-6">
          <p role="alert" className="text-sm text-red-700">
            {errorMessage}
          </p>
          <div className="mt-4">{goBack}</div>
        </div>
      ) : vocabularies.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-gray-900">
            Chủ đề chưa có từ vựng
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Hãy chọn một chủ đề khác để bắt đầu học.
          </p>
          <div className="mt-5">{goBack}</div>
        </div>
      ) : finished ? (
        <section className="my-auto rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Bạn đã hoàn thành lượt học
          </h1>
          <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-2xl font-bold text-emerald-700">
                {rememberedCount}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-600">Đã nhớ</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-bold text-gray-700">{reviewCount}</p>
              <p className="mt-1 text-xs font-medium text-gray-600">Cần ôn</p>
            </div>
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {reviewCount > 0 && (
              <button
                type="button"
                onClick={restartReview}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <RotateCcw className="h-4 w-4" />
                Ôn lại các từ cần ôn
              </button>
            )}
            {reviewOnly && (
              <button
                type="button"
                onClick={resetStudy}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Học lại toàn bộ
              </button>
            )}
            <Link
              to="/topics"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Về danh sách chủ đề
            </Link>
          </div>
        </section>
      ) : currentVocabulary ? (
        <>
          <header className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {reviewOnly ? "Lượt ôn tập" : "Luyện từ vựng"}
            </p>
          </header>

          <div className="relative flex min-h-[340px] flex-1 items-center justify-center">
            <button
              type="button"
              onClick={showPreviousCard}
              disabled={cardIndex === 0}
              aria-label="Thẻ trước"
              className="absolute left-0 z-10 hidden h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="w-full max-w-2xl px-0 sm:px-14">
              <button
                type="button"
                onClick={() => setIsFlipped((flipped) => !flipped)}
                className="relative flex min-h-[340px] w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm transition hover:border-emerald-200 sm:min-h-[380px] sm:p-10"
              >
                {isFlipped ? (
                  <>
                    <span className="text-xs font-semibold text-emerald-700">
                      Nghĩa tiếng Việt
                    </span>
                    <span className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                      {currentVocabulary.meaning}
                    </span>
                    {currentVocabulary.pronunciation && (
                      <span className="mt-3 text-sm text-gray-500">
                        {currentVocabulary.pronunciation}
                      </span>
                    )}
                    {currentVocabulary.examples?.[0] && (
                      <span className="mt-7 w-full rounded-xl bg-gray-50 p-4 text-left">
                        <span className="block text-xs font-semibold text-gray-500">
                          Câu ví dụ
                        </span>
                        <span className="mt-2 block text-sm font-semibold text-gray-900">
                          {currentVocabulary.examples[0].korean}
                        </span>
                        <span className="mt-1 block text-sm text-gray-600">
                          {currentVocabulary.examples[0].meaning}
                        </span>
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-gray-400">
                      Từ tiếng Hàn
                    </span>
                    <span className="mt-5 text-4xl font-bold tracking-wide text-gray-900 sm:text-6xl">
                      {currentVocabulary.korean}
                    </span>
                    <span className="mt-8 text-xs text-gray-400">
                      Nhấn vào thẻ hoặc phím Space để lật
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (speechAvailable) {
                    setVoiceNoticeId("");
                    speak(currentVocabulary.korean);
                  } else {
                    setVoiceNoticeId(currentVocabulary.id);
                  }
                }}
                className={`mx-auto mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 ${
                  speechAvailable ? "" : "opacity-50"
                }`}
              >
                <Volume2 className="h-4 w-4" />
                Nghe phát âm
              </button>
              {!speechAvailable && voiceNoticeId === currentVocabulary.id && (
                <p
                  role="status"
                  className="mx-auto max-w-lg text-center text-xs leading-relaxed text-gray-500"
                >
                  Thiết bị của bạn chưa có giọng đọc tiếng Hàn. Hãy thử trình
                  duyệt Microsoft Edge hoặc cài thêm giọng Korean trong cài đặt
                  giọng nói của hệ điều hành.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={showNextCard}
              aria-label="Thẻ tiếp theo"
              className="absolute right-0 z-10 hidden h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 sm:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mx-auto mt-5 w-full max-w-2xl">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
              <span>
                {cardIndex + 1} / {studyCards.length}
              </span>
              <span>
                {reviewOnly ? "Đang ôn các từ cần ôn" : "Tiến độ lượt học"}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${((cardIndex + 1) / studyCards.length) * 100}%`,
                }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => rateCurrentCard("review")}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-amber-300 hover:bg-amber-50"
              >
                Cần ôn
              </button>
              <button
                type="button"
                onClick={() => rateCurrentCard("remembered")}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Đã nhớ
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={showPreviousCard}
                disabled={cardIndex === 0}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-[11px] text-gray-400">
                Phím mũi tên trái / phải để chuyển thẻ
              </span>
              <button
                type="button"
                onClick={showNextCard}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition hover:text-emerald-700"
              >
                Sau
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Không tìm thấy từ vựng trong lượt học này.
        </p>
      )}
    </div>
  );
}
