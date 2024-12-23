import React from 'react';

const PrintStyles = () => {
  return (
    <style>
      {`
        @page {
          size: A4;
          margin: 0;
        }
        
        @media print {
          html, body {
            height: 100vh;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
          }
          
          body * {
            visibility: hidden;
          }
          
          #printSection, #printSection * {
            visibility: visible;
          }
          
          #printSection {
            position: fixed;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
          }
          
          .no-print {
            display: none !important;
          }
        }
        
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          height: 1rem;
          width: 1rem;
          border: 1px solid black;
          position: relative;
          background-color: white;
        }
        
        input[type="checkbox"]:checked::after {
          content: '\\2713';
          color: black;
          font-size: 0.9rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}
    </style>
  );
};

export default PrintStyles;