import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getHomePath } from "../../context/authContext";
import { useAuth } from "../../context/useAuth";
import Header from "../../layout/user/Header";
import Footer from "../../layout/user/Footer";
import HeroSection from "../../components/user/home/HeroSection";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import VerifyEmailNotice from "../../components/auth/VerifyEmailNotice";

export default function LoginPage() {
  // State quản lý việc hiển thị Đăng nhập hay Đăng ký
  const [isLogin, setIsLogin] = useState(true);
  // Kept after registering so Login opens with the email already filled in
  const [registeredEmail, setRegisteredEmail] = useState("");
  // After registering, the learner must confirm the emailed link before
  // logging in. { email, emailSent } while that notice is on screen.
  const [pendingVerification, setPendingVerification] = useState(null);

  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    const from = location.state?.from?.pathname;
    const isAdmin = user.role === "admin";
    const canReturn = from && from.startsWith("/admin") === isAdmin;
    return <Navigate to={canReturn ? from : getHomePath(user)} replace />;
  }

  const handleRegistered = (email, { emailSent }) => {
    setRegisteredEmail(email);
    setPendingVerification({ email, emailSent });
  };

  const handleBackToLogin = () => {
    setPendingVerification(null);
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
          {pendingVerification ? (
            <VerifyEmailNotice
              email={pendingVerification.email}
              emailSent={pendingVerification.emailSent}
              onBackToLogin={handleBackToLogin}
            />
          ) : isLogin ? (
            <LoginForm
              onSwitchToRegister={() => setIsLogin(false)}
              initialEmail={registeredEmail}
              notice={
                registeredEmail
                  ? "Hãy đăng nhập sau khi bạn đã xác nhận email."
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
