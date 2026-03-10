// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from '@/App.jsx';
// import '@/index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';

// ১. PDF.js গ্লোবাল কনফিগারেশন (যাতে PDF রেন্ডারিং ফাস্ট হয়)
import * as pdfjsLib from 'pdfjs-dist';

// CDN থেকে ওয়ার্কার লোড করা হচ্ছে যাতে মেইন থ্রেডে চাপ না পড়ে
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ২. অ্যাপ্লিকেশন মাউন্ট করা
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* সব গ্লোবাল প্রোভাইডার App.jsx এর ভেতরেই আছে */}
    <App />
  </React.StrictMode>
);