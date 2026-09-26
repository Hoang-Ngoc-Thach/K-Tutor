import React from "react";
import Header from "../../layout/user/Header";
import Flashcard from "../../components/flashcard-user/Flashcard";
import StudyActions from "../../components/flashcard-user/StudyActions";
import Footer from "../../layout/user/Footer";

export default function StudySessionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB]">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-2 flex flex-col justify-between">
        <div>
          <Flashcard />

          <StudyActions />
        </div>
      </main>
      <Footer />
    </div>
  );
}
