import React from "react";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center py-24 relative">
      {/* Left Glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-[#a78bfa]/20 rounded-full blur-3xl -z-10" />
      {/* Right Glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-[#a78bfa]/20 rounded-full blur-3xl -z-10" />
      <h1 className="text-6xl font-extrabold text-center text-[#a78bfa] mb-4 tracking-tight drop-shadow-lg">
        BiteBill
      </h1>
      <p className="text-2xl text-center text-gray-200 mb-8 font-medium">
        Split lunch bills easily with your team
      </p>
      <button className="bg-[#a78bfa] hover:bg-[#bfa3fa] text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all text-lg">
        Start Splitting
      </button>
    </section>
  );
}
