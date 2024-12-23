import React from 'react';
import { Printer } from 'lucide-react';

const PrintButton = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors no-print"
    >
      <Printer size={20} />
      <span>Print Form</span>
    </button>
  );
};

export default PrintButton;