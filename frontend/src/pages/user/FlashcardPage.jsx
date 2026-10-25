import React from "react";
import Flashcard from "../../components/user/flashcard/Flashcard";
import StudyActions from "../../components/user/flashcard/StudyActions";

export default function StudySessionPage() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-2 flex flex-col justify-between">
      <div>
        <Flashcard />

        <StudyActions />
      </div>
    </div>
  );
}
