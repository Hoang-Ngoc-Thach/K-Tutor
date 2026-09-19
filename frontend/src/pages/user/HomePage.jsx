import React from "react";
import Header from "../../layout/user/Header";
import Footer from "../../layout/user/Footer";
import HeroSection from "../../components/user/HeroSection";
import StatsBar from "../../components/user/StatsBar";
import FeaturesSection from "../../components/user/FeaturesSection";
import PracticeTopics from "../../components/user/PracticeTopics";
import MiniChallenge from "../../components/user/MiniChallenge";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-12">
        <HeroSection />

        <StatsBar />

        <FeaturesSection />

        <PracticeTopics />

        <MiniChallenge />
      </main>

      <Footer />
    </div>
  );
}
