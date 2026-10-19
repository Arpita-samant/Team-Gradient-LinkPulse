import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-[var(--line)] bg-[var(--glass)] backdrop-blur-md py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--fg3)] font-ndot">
        <span>© 2026 Link Pulse. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy'); }} className="hover:text-[var(--fg)] cursor-pointer">Privacy Policy</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service'); }} className="hover:text-[var(--fg)] cursor-pointer">Terms of Service</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); alert('Contact Us'); }} className="hover:text-[var(--fg)] cursor-pointer">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}
