import React from "react";
import { Flame } from "lucide-react";

// Ngọn lửa + số ngày chuỗi. Xám khi chuỗi = 0, cam khi đang có chuỗi.
export default function StreakFlame({ days, size = "md" }) {
  const active = days > 0;
  const big = size === "lg";

  return (
    <div className="flex items-center gap-2">
      <Flame
        aria-hidden="true"
        className={`${big ? "h-12 w-12" : "h-8 w-8"} ${
          active ? "fill-orange-400 text-orange-500" : "text-gray-300"
        }`}
      />
      <div className="leading-none">
        <span
          className={`${big ? "text-5xl" : "text-3xl"} font-bold ${
            active ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {days}
        </span>
        <span className="ml-1.5 text-sm font-semibold text-gray-500">ngày</span>
      </div>
    </div>
  );
}
