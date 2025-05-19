import React from "react";

export default function ReceiptCard() {
  return (
    <div className="bg-[#232336] dark:bg-[#232336] rounded-2xl shadow-xl p-8 w-full max-w-xs mx-auto mt-8 border border-[#232336]/60 dark:border-[#232336]/80 backdrop-blur-md relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 z-0 rounded-2xl pointer-events-none">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3/4 h-1/2 bg-[#a78bfa]/20 blur-2xl rounded-full" />
      </div>
      <div className="relative z-10">
        <h2 className="text-lg font-bold text-center mb-1 text-white">Lunch Receipt</h2>
        <p className="text-xs text-center text-gray-400 mb-4">Today&#39;s date</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white">Sandwich</span>
            <span className="text-white">$8.50</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white">Salad</span>
            <span className="text-white">$7.25</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white">Coffee</span>
            <span className="text-white">$3.75</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white">Dessert</span>
            <span className="text-white">$5.50</span>
          </div>
        </div>
        <div className="border-t border-[#393950] my-4"></div>
        <div className="flex justify-between font-bold">
          <span className="text-white">Total</span>
          <span className="text-white">$25.00</span>
        </div>
        <p className="text-xs text-center text-[#a78bfa] mt-2">Split between 3 team members</p>
      </div>
    </div>
  );
}
