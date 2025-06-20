"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import GameCtaSection from "@/components/home/GameCtaSection";
import PricingSection from "@/components/home/PricingSection";
import FaqSection from "@/components/home/FaqSection";
import FinalCtaSection from "@/components/home/FinalCtaSection";
import FooterSection from "@/components/home/FooterSection";

export default function HomePage() {
  const [scrollPosition, setScrollPosition] = useState(0);

  // * Track scroll position for parallax and animation effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-line-grid opacity-60 pointer-events-none z-0"></div>

      {/* Animated decorative elements */}
      <div
        className="fixed top-20 right-20 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-xl z-0"
        style={{
          transform: `translate(${scrollPosition * 0.05}px, ${scrollPosition * -0.02}px)`,
        }}
      ></div>
      <div
        className="fixed bottom-40 left-10 w-56 h-56 bg-pink-400 opacity-10 rounded-full blur-xl z-0"
        style={{
          transform: `translate(${scrollPosition * -0.03}px, ${scrollPosition * 0.02}px)`,
        }}
      ></div>
      <div
        className="fixed top-60 left-1/4 w-24 h-24 bg-blue-400 opacity-10 rounded-full blur-xl z-0"
        style={{
          transform: `translate(${scrollPosition * -0.07}px, ${scrollPosition * 0.05}px)`,
        }}
      ></div>

      <Header />

      {/* Main Page Sections */}
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <GameCtaSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
      <FooterSection />
    </div>
  );
}
