import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "./pages/user/HomePage";
import AuthPage from "./pages/auth/Authpage";
import FlashcardPage from "./pages/user/FlashcardPage";
import TopicListPage from "./pages/user/TopicListPage";
import WordLearingPage from "./pages/user/WordLearingPage";
import AuthProvider from "./context/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          //Auth route
          <Route path="/auth" element={<AuthPage />} />
          //User route
          <Route path="/" element={<HomePage />} />
          <Route
            path="/flashcard"
            element={
              <ProtectedRoute>
                <FlashcardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics"
            element={
              <ProtectedRoute>
                <TopicListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <WordLearingPage />
              </ProtectedRoute>
            }
          />
          //Admin route
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute role="admin">
                <AdminContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
