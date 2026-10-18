import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 text-center transition-colors">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4">
        <span>© 2026 LinkPulse. All rights reserved.</span>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
        <a href="#privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Privacy Policy
        </a>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
        <a href="#terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Terms of Service
        </a>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
        <a href="#contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Contact Us
        </a>
      </div>
    </footer>
  );
}
