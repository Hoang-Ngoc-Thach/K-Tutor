import React from "react";

// Bảng số câu: xanh = đã trả lời, vàng = đánh dấu xem lại, viền đậm = câu hiện tại.
export default function TopikQuestionPalette({
  questions,
  answers,
  flagged,
  currentIndex,
  onJump,
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => {
          const answered = answers[question.id] !== undefined;
          const isFlagged = flagged.includes(question.id);
          const isCurrent = index === currentIndex;

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onJump(index)}
              aria-label={`Câu ${index + 1}${answered ? ", đã trả lời" : ""}${isFlagged ? ", đã đánh dấu" : ""}`}
              aria-current={isCurrent ? "true" : undefined}
              className={`relative h-9 rounded-lg border text-xs font-semibold transition ${
                answered
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200"
              } ${isCurrent ? "ring-2 ring-emerald-500 ring-offset-1" : ""}`}
            >
              {index + 1}
              {isFlagged && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-emerald-200" /> Đã làm
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded border border-gray-300 bg-white" /> Chưa làm
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Xem lại
        </span>
      </div>
    </div>
  );
}
