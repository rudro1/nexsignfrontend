

// import React from 'react';
// import Navbar from '@/components/layout/Navbar';
// import { HeroSection } from '@/components/HeroSection';
// import { FeaturesSection } from '@/components/FeaturesSection';
// import { HowItWorksSection } from '@/components/HowItWorksSection';
// import { FooterSection } from '@/components/FooterSection';

// export function Landing({ onNavigate }) {
//   return (
//     /* bg-white সরিয়ে ডার্ক মোড সাপোর্ট যোগ করা হয়েছে */
//     <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
//       <Navbar onNavigate={onNavigate} />
//       <main>
//         <HeroSection onGetStarted={() => onNavigate('dashboard')} />
//         <FeaturesSection />
//         <HowItWorksSection />
//       </main>
//       <FooterSection />
//     </div>
//   );
// }

// src/pages/Landing.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate }  from 'react-router-dom';
import { useAuth }            from '@/lib/AuthContext';
import { Button }             from '@/components/ui/button';
import {
  FileSignature, Zap, Shield, Users, CheckCircle,
  ArrowRight, Star, Globe, Lock, Clock, ChevronDown,
  FileText, Send, Award, BarChart3, Menu, X,
} from 'lucide-react';

// ════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════
const FEATURES = [
  {
    icon:  Zap,
    color: 'sky',
    title: 'Lightning Fast',
    desc:  'Send documents for signature in seconds. No printing, scanning, or faxing required.',
  },
  {
    icon:  Shield,
    color: 'violet',
    title: 'Bank-Level Security',
    desc:  'AES-256 encryption, tamper-proof audit trails, and compliance with global e-sign laws.',
  },
  {
    icon:  Users,
    color: 'emerald',
    title: 'Multi-Party Signing',
    desc:  'Add multiple signers in any order. Automated reminders keep everyone on track.',
  },
  {
    icon:  Globe,
    color: 'amber',
    title: 'Sign Anywhere',
    desc:  'Works on any device — desktop, tablet, or mobile. No app download required.',
  },
  {
    icon:  FileText,
    color: 'rose',
    title: 'Smart Templates',
    desc:  'Create reusable document templates. Send to hundreds of signers with one click.',
  },
  {
    icon:  BarChart3,
    color: 'indigo',
    title: 'Real-time Tracking',
    desc:  'See exactly when documents are opened, signed, and completed with live updates.',
  },
];

const STEPS = [
  {
    step:  '01',
    icon:  FileText,
    title: 'Upload Document',
    desc:  'Upload any PDF. Drag & drop signature fields where needed.',
    color: 'sky',
  },
  {
    step:  '02',
    icon:  Send,
    title: 'Send for Signature',
    desc:  'Add signers by email. They receive a secure signing link instantly.',
    color: 'violet',
  },
  {
    step:  '03',
    icon:  CheckCircle,
    title: 'Signed & Done',
    desc:  'Get notified when signed. Download the completed PDF with audit trail.',
    color: 'emerald',
  },
];

const TESTIMONIALS = [
  {
    name:    'Sarah Johnson',
    role:    'HR Director, TechCorp',
    avatar:  'SJ',
    color:   'sky',
    rating:  5,
    text:    'NeXsign reduced our contract turnaround from days to minutes. Absolutely game-changing for our HR team.',
  },
  {
    name:    'Ahmed Hassan',
    role:    'Legal Counsel, LawFirm Pro',
    avatar:  'AH',
    color:   'violet',
    rating:  5,
    text:    'The audit trail feature is exceptional. Every signature is legally compliant and fully traceable.',
  },
  {
    name:    'Emily Chen',
    role:    'Operations Lead, StartupXYZ',
    avatar:  'EC',
    color:   'emerald',
    rating:  5,
    text:    'We send 500+ contracts monthly using bulk send. NeXsign handles it flawlessly every time.',
  },
];

const STATS = [
  { value: '50K+',  label: 'Documents Signed',  icon: FileSignature },
  { value: '99.9%', label: 'Uptime Guaranteed', icon: Zap          },
  { value: '150+',  label: 'Countries Supported', icon: Globe       },
  { value: '4.9★',  label: 'Average Rating',    icon: Star         },
];

// ── Color map ────────────────────────────────────────────────────
const COLOR = {
  sky:     { bg: 'bg-sky-50',     icon: 'text-sky-500',     ring: 'ring-sky-200'     },
  violet:  { bg: 'bg-violet-50',  icon: 'text-violet-500',  ring: 'ring-violet-200'  },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', ring: 'ring-emerald-200' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-500',   ring: 'ring-amber-200'   },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-500',    ring: 'ring-rose-200'    },
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-500',  ring: 'ring-indigo-200'  },
};

// ════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════

// ── Navbar ───────────────────────────────────────────────────────
function Navbar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const NAV_LINKS = [
    { label: 'Features',  id: 'features'  },
    { label: 'How it works', id: 'how-it-works' },
    { label: 'Testimonials', id: 'testimonials'  },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-200/60 dark:border-slate-800/60'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 
                            to-sky-600 rounded-lg flex items-center 
                            justify-center shadow-lg shadow-sky-500/30">
              <FileSignature className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 
                             dark:text-white tracking-tight">
              NeX<span className="text-sky-500">sign</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="px-4 py-2 text-sm font-medium 
                           text-slate-600 dark:text-slate-400 
                           hover:text-slate-900 dark:hover:text-white 
                           hover:bg-slate-100 dark:hover:bg-slate-800 
                           rounded-lg transition-all duration-150"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button
                onClick={() =>
                  navigate(isAdmin ? '/admin' : '/dashboard')
                }
                className="bg-sky-500 hover:bg-sky-600 text-white 
                           rounded-xl px-5 gap-2 font-semibold
                           shadow-lg shadow-sky-500/25 
                           transition-all active:scale-95"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="font-semibold text-slate-600 
                               dark:text-slate-400 rounded-xl 
                               hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    className="bg-sky-500 hover:bg-sky-600 text-white 
                               rounded-xl px-5 font-semibold 
                               shadow-lg shadow-sky-500/25 
                               transition-all active:scale-95"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-xl text-slate-600 
                       dark:text-slate-400 hover:bg-slate-100 
                       dark:hover:bg-slate-800 transition-colors"
          >
            {menuOpen
              ? <X       className="w-5 h-5" />
              : <Menu    className="w-5 h-5" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 
                        border-t border-slate-200 dark:border-slate-800
                        px-4 py-4 space-y-1 
                        animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map(l => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="w-full text-left px-4 py-3 text-sm 
                         font-medium text-slate-600 dark:text-slate-400 
                         hover:bg-slate-50 dark:hover:bg-slate-800 
                         rounded-xl transition-colors"
            >
              {l.label}
            </button>
          ))}
          <div className="pt-2 space-y-2 border-t 
                          border-slate-100 dark:border-slate-800">
            {user ? (
              <Button
                onClick={() => {
                  setMenuOpen(false);
                  navigate(isAdmin ? '/admin' : '/dashboard');
                }}
                className="w-full bg-sky-500 hover:bg-sky-600 
                           text-white rounded-xl font-semibold"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl font-semibold"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <Button
                    className="w-full bg-sky-500 hover:bg-sky-600 
                               text-white rounded-xl font-semibold 
                               shadow-lg shadow-sky-500/25"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────
function HeroSection() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center 
                        justify-center overflow-hidden pt-16">

      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br 
                        from-sky-50 via-white to-violet-50 
                        dark:from-slate-950 dark:via-slate-900 
                        dark:to-slate-950" />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 
                        bg-sky-400/10 rounded-full blur-3xl 
                        animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 
                        bg-violet-400/10 rounded-full blur-3xl 
                        animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
                      py-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 
                        bg-sky-50 dark:bg-sky-900/30 
                        border border-sky-200 dark:border-sky-800 
                        rounded-full px-4 py-1.5 mb-6">
          <Zap className="w-3.5 h-3.5 text-sky-500" />
          <span className="text-xs font-semibold text-sky-600 
                           dark:text-sky-400">
            Trusted by 50,000+ professionals worldwide
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
                       font-extrabold text-slate-900 dark:text-white 
                       leading-tight tracking-tight mb-6">
          Sign Documents{' '}
          <span className="relative">
            <span className="text-transparent bg-clip-text 
                             bg-gradient-to-r from-sky-500 to-violet-500">
              Instantly
            </span>
          </span>
          <br className="hidden sm:block" />
          {' '}From Anywhere
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-600 
                      dark:text-slate-400 max-w-2xl mx-auto mb-10 
                      leading-relaxed">
          The fastest, most secure e-signature platform.
          Upload, send, and sign legally binding documents in seconds.
          No printing. No scanning. Just done.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center 
                        justify-center gap-4 mb-16">
          <Button
            onClick={() =>
              navigate(
                user
                  ? isAdmin ? '/admin' : '/dashboard'
                  : '/register'
              )
            }
            size="lg"
            className="w-full sm:w-auto px-8 h-13 
                       bg-sky-500 hover:bg-sky-600 
                       active:bg-sky-700 text-white font-bold 
                       rounded-2xl shadow-xl shadow-sky-500/30 
                       transition-all duration-150 
                       active:scale-95 text-base gap-2"
          >
            {user ? 'Go to Dashboard' : 'Start for Free'}
            <ArrowRight className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              document
                .getElementById('how-it-works')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="w-full sm:w-auto px-8 h-13 rounded-2xl 
                       border-slate-300 dark:border-slate-700 
                       text-slate-700 dark:text-slate-300 
                       font-semibold hover:bg-slate-50 
                       dark:hover:bg-slate-800 transition-all 
                       text-base gap-2"
          >
            See How It Works
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center 
                        justify-center gap-6 text-sm 
                        text-slate-500 dark:text-slate-400">
          {[
            { icon: Lock,         text: 'SSL Encrypted'    },
            { icon: Award,        text: 'Legally Binding'  },
            { icon: CheckCircle,  text: 'GDPR Compliant'   },
            { icon: Clock,        text: 'Sign in 60 seconds' },
          ].map(({ icon: Icon, text }) => (
            <div key={text}
                 className="flex items-center gap-1.5">
              <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────
function StatsSection() {
  return (
    <section className="py-16 bg-slate-900 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 bg-sky-500/10 rounded-2xl 
                              flex items-center justify-center 
                              mx-auto mb-3">
                <Icon className="w-6 h-6 text-sky-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {value}
              </div>
              <div className="text-sm text-slate-400 font-medium">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 bg-white dark:bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold 
                           uppercase tracking-widest 
                           text-sky-500 mb-3">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold 
                         text-slate-900 dark:text-white mb-4">
            Everything you need to sign faster
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 
                        max-w-2xl mx-auto">
            Powerful tools designed for modern teams.
            Simple enough for anyone to use in minutes.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => {
            const c = COLOR[color];
            return (
              <div
                key={title}
                className="group relative p-6 rounded-2xl border 
                           border-slate-200 dark:border-slate-800 
                           bg-white dark:bg-slate-800/50 
                           hover:border-sky-300 dark:hover:border-sky-700 
                           hover:shadow-lg hover:shadow-sky-500/10 
                           transition-all duration-300 
                           hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${c.bg} dark:bg-slate-700 
                                 rounded-xl flex items-center 
                                 justify-center mb-4 
                                 ring-2 ring-transparent 
                                 group-hover:${c.ring} 
                                 transition-all duration-300`}>
                  <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <h3 className="font-bold text-slate-900 
                               dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 
                              text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold 
                           uppercase tracking-widest 
                           text-sky-500 mb-3">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold 
                         text-slate-900 dark:text-white mb-4">
            Sign in 3 simple steps
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 
                        max-w-xl mx-auto">
            From upload to signed document in under 2 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 
                          left-1/3 right-1/3 h-px 
                          bg-gradient-to-r from-sky-300 to-violet-300 
                          dark:from-sky-700 dark:to-violet-700" />

          {STEPS.map(({ step, icon: Icon, title, desc, color }, i) => {
            const c = COLOR[color];
            return (
              <div key={step}
                   className="relative text-center group">
                {/* Step number */}
                <div className="relative inline-flex mb-6">
                  <div className={`w-16 h-16 ${c.bg} dark:bg-slate-800 
                                   rounded-2xl flex items-center 
                                   justify-center mx-auto 
                                   shadow-lg group-hover:scale-110 
                                   transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${c.icon}`} />
                  </div>
                  <span className="absolute -top-2 -right-2 
                                   w-6 h-6 bg-slate-900 dark:bg-white 
                                   text-white dark:text-slate-900 
                                   rounded-full text-xs font-bold 
                                   flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 
                               dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 
                              text-sm leading-relaxed max-w-xs mx-auto">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link to="/register">
            <Button
              size="lg"
              className="px-10 h-13 bg-sky-500 hover:bg-sky-600 
                         text-white font-bold rounded-2xl 
                         shadow-xl shadow-sky-500/30 
                         transition-all active:scale-95 gap-2"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-slate-400 text-sm mt-3">
            No credit card required · Free forever plan
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-24 bg-white dark:bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold 
                           uppercase tracking-widest 
                           text-sky-500 mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold 
                         text-slate-900 dark:text-white mb-4">
            Loved by professionals worldwide
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(
            ({ name, role, avatar, color, rating, text }) => {
              const c = COLOR[color];
              return (
                <div
                  key={name}
                  className="p-6 rounded-2xl border 
                             border-slate-200 dark:border-slate-800 
                             bg-white dark:bg-slate-800/50 
                             hover:shadow-lg hover:-translate-y-1 
                             transition-all duration-300"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 
                                text-sm leading-relaxed mb-6 italic">
                    &ldquo;{text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${c.bg} dark:bg-slate-700 
                                     rounded-full flex items-center 
                                     justify-center`}>
                      <span className={`text-sm font-bold ${c.icon}`}>
                        {avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm 
                                      text-slate-900 dark:text-white">
                        {name}
                      </div>
                      <div className="text-xs text-slate-500 
                                      dark:text-slate-400">
                        {role}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────
function CTASection() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br 
                        from-sky-500 to-violet-600 
                        dark:from-sky-600 dark:to-violet-700 
                        relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 
                        bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 
                        bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 
                      lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold 
                       text-white mb-6 leading-tight">
          Ready to go paperless?
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
          Join thousands of professionals who trust NeXsign for
          secure, fast document signing.
        </p>

        <div className="flex flex-col sm:flex-row items-center 
                        justify-center gap-4">
          <Button
            size="lg"
            onClick={() =>
              navigate(
                user
                  ? isAdmin ? '/admin' : '/dashboard'
                  : '/register'
              )
            }
            className="w-full sm:w-auto px-10 h-13 
                       bg-white hover:bg-slate-50 
                       text-sky-600 font-bold rounded-2xl 
                       shadow-xl transition-all 
                       active:scale-95 gap-2"
          >
            {user ? 'Go to Dashboard' : 'Start Free Today'}
            <ArrowRight className="w-5 h-5" />
          </Button>

          {!user && (
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-10 h-13 
                           rounded-2xl border-2 border-white/40 
                           text-white hover:bg-white/10 
                           font-semibold transition-all"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────
function Footer() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 
                       border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
                      py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-sky-500 rounded-lg 
                              flex items-center justify-center">
                <FileSignature className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                NeX<span className="text-sky-400">sign</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              The fastest way to get documents signed.
              Secure, legal, and simple.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">
              Product
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Features',     id: 'features'     },
                { label: 'How it works', id: 'how-it-works' },
                { label: 'Testimonials', id: 'testimonials' },
              ].map(l => (
                <li key={l.label}>
                  <button
                    onClick={() => scrollTo(l.id)}
                    className="text-slate-400 hover:text-white 
                               text-sm transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">
              Company
            </h4>
            <ul className="space-y-3">
              {['About', 'Privacy Policy', 'Terms of Service'].map(l => (
                <li key={l}>
                  <Link
                    to="#"
                    className="text-slate-400 hover:text-white 
                               text-sm transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">
              Get Started
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/register"
                  className="text-slate-400 hover:text-white 
                             text-sm transition-colors"
                >
                  Sign Up Free
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-white 
                             text-sm transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 
                        flex flex-col sm:flex-row items-center 
                        justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} NeXsign. 
            All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 
                          text-slate-500 text-sm">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            SSL Secured · GDPR Compliant
          </div>
        </div>
      </div>
    </footer>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ════════════════════════════════════════════════════════════════
export default function Landing() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 
                    transition-colors duration-300">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}