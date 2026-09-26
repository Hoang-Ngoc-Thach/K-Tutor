import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/user/HomePage";
import LoginPage from "./pages/user/LoginPage";
import FlashcardPage from "./pages/user/FlashcardPage";
import TopicListPage from "./pages/user/TopicListPage";
import WordLearingPage from "./pages/user/WordLearingPage"; // 1. Import trang học từ mới

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/flashcard" element={<FlashcardPage />} />
        <Route path="/topics" element={<TopicListPage />} />
        <Route path="/learn" element={<WordLearingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
