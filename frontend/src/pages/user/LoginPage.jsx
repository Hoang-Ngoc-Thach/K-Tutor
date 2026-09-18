import React from "react";
import Header from "../../layout/user/Header";
import Footer from "../../layout/user/Footer";
import HeroSection from "../../components/user/HeroSection";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          {/* Truyền prop ẩn chat ở đây */}
          <HeroSection showChat={false} />
        </div>

        <div className="lg:col-span-5">
          <LoginForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
