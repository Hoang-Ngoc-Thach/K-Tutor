import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getHomePath } from "../../context/authContext";
import { useAuth } from "../../context/useAuth";
import Header from "../../layout/user/Header";
import Footer from "../../layout/user/Footer";
import HeroSection from "../../components/home-user/HeroSection";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm"; // Import thêm form đăng ký

export default function LoginPage() {
  // State quản lý việc hiển thị Đăng nhập hay Đăng ký
  const [isLogin, setIsLogin] = useState(true);
  // Kept after registering so Login opens with the email already filled in
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { user } = useAuth();
  const location = useLocation();

  // Already logged in (or just logged in): leave the auth page.
  // Go back to the page that required login, otherwise to the role's home.
  if (user) {
    const from = location.state?.from?.pathname;
    return <Navigate to={from || getHomePath(user)} replace />;
  }

  const handleRegistered = (email) => {
    setRegisteredEmail(email);
    setIsLogin(true);
  };

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
            <LoginForm
              onSwitchToRegister={() => setIsLogin(false)}
              initialEmail={registeredEmail}
              notice={
                registeredEmail
                  ? "Đăng ký thành công! Vui lòng đăng nhập để bắt đầu."
                  : ""
              }
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setIsLogin(true)}
              onRegistered={handleRegistered}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
