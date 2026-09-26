import React from "react";
import LessonHeader from "../../components/topiclearn-user/LessonHeader";
import WordHeader from "../../components/topiclearn-user/WordHeader";
import WordDetailsCard from "../../components/topiclearn-user/WordDetailsCard";
import ExampleCard from "../../components/topiclearn-user/ExampleCard";
import VoicePractice from "../../components/topiclearn-user/VoicePractice";
import WordTips from "../../components/topiclearn-user/WordTips";
import LessonFooter from "../../components/topiclearn-user/LessonFooter";
import { ArrowRight } from "lucide-react";

export default function WordLearingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LessonHeader />

      {/* Vùng nội dung chính */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4">
        <WordHeader />
        <WordDetailsCard />
        <ExampleCard />
        <VoicePractice />
        <WordTips />
      </main>

      {/* Thanh hành động (Cố định ở đáy) */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
            <span className="bg-gray-100 px-2 py-1 rounded text-gray-500">
              Space
            </span>{" "}
            để nghe lại
            <span className="bg-gray-100 px-2 py-1 rounded text-gray-500">
              Enter
            </span>{" "}
            để tiếp tục
          </div>

          <button className="w-full md:w-auto bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
            Đã hiểu, Tiếp tục <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer nhỏ ở dưới cùng */}
      <div className="pb-24">
        <LessonFooter />
      </div>
    </div>
  );
}
