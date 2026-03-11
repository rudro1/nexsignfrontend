
import React from 'react';
import Navbar from './components/layout/Navbar';
import { useTheme } from '@/App'; 
export default function Layout({ children, currentPageName }) {
  // গ্লোবাল কন্টেক্সট থেকে থিম এবং টগল ফাংশন নিন
  const { theme, toggleTheme } = useTheme();

  // সাইনার ভিউতে নেভবার সাধারণত হাইড থাকে বা স্পেসিং আলাদা হয়
  const isSignerView = currentPageName === 'sign'; 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      {/* ১. সাইনার ভিউ না হলে নেভবার দেখান */}
      {!isSignerView && (
        <Navbar 
          currentPageName={currentPageName} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      )}

      {/* ২. কন্টেন্ট এরিয়া */}
      <main className={`flex-1 ${!isSignerView ? 'pt-16' : ''}`}>
        <div className={isSignerView ? 'w-full h-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
          {children}
        </div>
      </main>

      {/* ৩. দরকার হলে এখানে একটি ফুটার যোগ করতে পারেন */}
    </div>
  );
}