

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { FooterSection } from '@/components/FooterSection';

export function Landing({ onNavigate }) {
  return (
    /* bg-white সরিয়ে ডার্ক মোড সাপোর্ট যোগ করা হয়েছে */
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar onNavigate={onNavigate} />
      <main>
        <HeroSection onGetStarted={() => onNavigate('dashboard')} />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <FooterSection />
    </div>
  );
}