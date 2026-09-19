import React, { useState } from "react";
import Header from "../../layout/user/Header";
import Footer from "../../layout/user/Footer";
import HeroSection from "../../components/user/HeroSection";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm"; // Import thêm form đăng ký

export default function LoginPage() {
  // State quản lý việc hiển thị Đăng nhập hay Đăng ký
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7">
          <HeroSection showChat={false} />
        </div>

        {/* Right Column - Gọi Form tương ứng */}
        <div className="lg:col-span-5">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
