import React from "react";

export default function LessonFooter() {
  return (
    <footer className="w-full flex flex-col md:flex-row items-center justify-between py-6 px-4 md:px-8 border-t border-gray-200 mt-10 text-[10px] font-semibold text-gray-400">
      <div>© 2026 K-Tutor Korean Academy. All rights reserved.</div>
      <div className="flex gap-4 mt-2 md:mt-0">
        <a href="#" className="hover:text-gray-600">
          Vocabulary Bank
        </a>
        <a href="#" className="hover:text-gray-600">
          Grammar Guide
        </a>
        <a href="#" className="hover:text-gray-600">
          Settings
        </a>
      </div>
    </footer>
  );
}
