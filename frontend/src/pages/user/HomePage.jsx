import React from 'react';
import Header from '../../layout/user/Header';
import Footer from '../../layout/user/Footer';
import HeroSection from '../../components/user/HeroSection';
import LoginForm from '../../components/auth/LoginForm';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Hero / AI Info */}
        <div className="lg:col-span-7">
          <HeroSection />
        </div>

        {/* Right Column - Auth Box */}
        <div className="lg:col-span-5">
          <LoginForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}