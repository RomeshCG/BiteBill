import React from "react";
import HeroSection from "../../components/HeroSection";
import ReceiptCard from "../../components/ReceiptCard";
import FeaturesSection from "../../components/FeaturesSection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background">
      <header className="w-full">
        <HeroSection />
      </header>
      <main className="flex flex-col items-center flex-grow">
        <ReceiptCard />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
