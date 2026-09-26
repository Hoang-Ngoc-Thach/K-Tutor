import React from "react";
import Header from "../../layout/user/Header";
import Footer from "../../layout/user/Footer";
import HeroSection from "../../components/home-user/HeroSection";
import FeaturesSection from "../../components/home-user/FeaturesSection";
import PracticeTopics from "../../components/home-user/PracticeTopics";
import MiniChallenge from "../../components/home-user/MiniChallenge";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-12">
        <HeroSection />

        <FeaturesSection />

        <PracticeTopics />

        <MiniChallenge />
      </main>

      <Footer />
    </div>
  );
}
