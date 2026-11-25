import React from "react";
import { useAuth } from "../../context/useAuth";
import GuestHome from "../../components/user/home/GuestHome";
import LearnerHome from "../../components/user/home/LearnerHome";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <p className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-gray-500 md:px-6">
        Đang tải...
      </p>
    );
  }

  return user ? <LearnerHome user={user} /> : <GuestHome />;
}
