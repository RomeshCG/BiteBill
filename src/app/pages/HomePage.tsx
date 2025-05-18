import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-gradient-to-br from-[#16222A] via-[#3A6073] to-[#1A2980]">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-10 sm:p-16 flex flex-col items-center w-full max-w-lg">
        <div className="bg-gradient-to-tr from-blue-600 via-cyan-500 to-green-400 p-3 rounded-full mb-6 shadow-lg">
          <Image
            src="/file.svg"
            alt="BiteBill Logo"
            width={56}
            height={56}
            className="drop-shadow-xl"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 text-center tracking-tight drop-shadow-lg">
          Split Bills. <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">No Stress.</span>
        </h1>
        <p className="text-lg text-white/80 mb-10 text-center max-w-md font-medium">
          BiteBill makes sharing food expenses with your team effortless, fair, and fast. Enjoy a modern, secure, and beautiful experience.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-green-400 text-white font-semibold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200"
        >
          <span>Get Started</span>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </Link>
      </div>
    </main>
  );
}
