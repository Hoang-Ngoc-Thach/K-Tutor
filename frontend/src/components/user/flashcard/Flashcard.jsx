import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FFlashcard from "./FFlashcard";
import BFlashcard from "./BFlashcard";

export default function Flashcard() {
  const [isFlipped, setIsFlipped] = useState(false);

  // Xử lý sự kiện nhấn phím Space
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto my-6 flex items-center justify-center">
      {/* Nút điều hướng Trái */}
      <button className="absolute left-0 -ml-16 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-emerald-700 hover:border-emerald-200 transition-colors z-10">
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Container tạo phối cảnh 3D */}
      <div className="w-full perspective-[1000px]">
        {/* Khung xoay 3D */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full min-h-[480px] cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <FFlashcard />
          <BFlashcard />
        </div>
      </div>

      {/* Nút điều hướng Phải */}
      <button className="absolute right-0 -mr-16 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-emerald-700 hover:border-emerald-200 transition-colors z-10">
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
