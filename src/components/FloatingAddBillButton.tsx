import React from 'react';
import { FaPlus } from 'react-icons/fa';

const FloatingAddBillButton = () => {
  const handleClick = () => {
    const el = document.getElementById('your-bills-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <button
      className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg text-3xl transition-colors"
      onClick={handleClick}
      aria-label="Add Bill"
    >
      <FaPlus />
    </button>
  );
};

export default FloatingAddBillButton;
