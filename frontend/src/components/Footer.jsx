import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-zinc-200 dark:border-zinc-850 text-xs text-zinc-500 dark:text-zinc-500 text-center transition-colors">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4">
        <span>© 2026 LinkPulse. All rights reserved.</span>
        <span className="hidden sm:inline text-zinc-300 dark:text-zinc-750">|</span>
        <a href="#privacy" className="hover:text-red-500 dark:hover:text-red-400 transition-colors">
          Privacy Policy
        </a>
        <span className="hidden sm:inline text-zinc-750">|</span>
        <a href="#terms" className="hover:text-red-400 transition-colors">
          Terms of Service
        </a>
        <span className="hidden sm:inline text-zinc-750">|</span>
        <a href="#contact" className="hover:text-red-400 transition-colors">
          Contact Us
        </a>
      </div>
    </footer>
  );
}
