import React from "react";
import { Check } from "lucide-react";
import { weekdayLabel } from "./streakUtils";

// 7 ngày gần nhất, ngày hôm nay nằm cuối. Ngày đã ôn tập có dấu tích.
export default function WeekStrip({ days, today }) {
  return (
    <ol className="flex gap-2" aria-label="7 ngày gần nhất">
      {days.map((day) => {
        const isToday = day.date === today;
        return (
          <li
            key={day.date}
            className="flex flex-col items-center gap-1.5"
            aria-label={`${weekdayLabel(day.date)}: ${day.studied ? "đã ôn tập" : "chưa ôn tập"}`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                day.studied
                  ? "bg-orange-400 text-white"
                  : isToday
                    ? "border-2 border-dashed border-orange-300 bg-white"
                    : "border border-gray-200 bg-white"
              }`}
            >
              {day.studied && <Check className="h-4 w-4" aria-hidden="true" />}
            </span>
            <span
              className={`text-[11px] font-medium ${
                isToday ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {weekdayLabel(day.date)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
