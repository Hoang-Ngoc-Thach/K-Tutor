import React from "react";
import HeroSection from "../../components/user/home/HeroSection";
import FeaturesSection from "../../components/user/home/FeaturesSection";
import PracticeTopics from "../../components/user/home/PracticeTopics";

export default function HomePage() {
  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-12">
      <HeroSection />

      <FeaturesSection />

      <PracticeTopics />
    </div>
  );
}
