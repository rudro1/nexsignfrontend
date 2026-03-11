import React from 'react';
import { PenTool, Twitter, Linkedin, Github } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import Logo from './ui/Logo';
export function FooterSection() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-500 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-16 shadow-2xl shadow-sky-900/20">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Simplify Your Document Signing?
            </h2>
            <p className="text-sky-100 text-lg">
              Join thousands of businesses who trust FixenSysign for their
              secure document workflows.
            </p>
          </div>
          <button
            
            className="bg-white text-sky-500 btn hover:bg-sky-50 border-none shadow-lg whitespace-nowrap p-4 rounded-xl font-bold">

            Start Free Trial
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
             
             <Logo></Logo>
            
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Secure, fast, and legally binding digital signatures for modern
              businesses. Simplify your workflow today.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors">

                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors">

                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors">

                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} FixenSysign. All rights reserved.
        </div>
      </div>
    </footer>);

}