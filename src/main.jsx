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

// ✅ Worker এখানে SET করবে না — PdfViewer.jsx এ আছে
// main.jsx এ duplicate workerSrc set করলে conflict হয়

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);