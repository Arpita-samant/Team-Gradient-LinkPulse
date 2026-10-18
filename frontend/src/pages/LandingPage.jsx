import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import {
  Link2,
  BarChart3,
  QrCode,
  FolderKanban,
  ArrowRight,
  Sun,
  Moon,
  Copy,
  CheckCircle2,
  Share2,
  TrendingUp,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('https://linkpulse.com/abc123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Link2 className="w-5 h-5 -rotate-45" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
            LinkPulse
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {user ? (
            <Link
              to="/analytics"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#5850ec] hover:bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#5850ec] hover:bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section matching Page 1 screenshot */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column Content */}
        <div className="flex-1 max-w-xl space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Shorten Links.<br />
            Track Performance.<br />
            <span className="text-[#5850ec] dark:text-indigo-400">Grow Faster.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            LinkPulse is a powerful URL shortener and analytics platform that helps you create short links,
            track clicks, manage campaigns, and get valuable insights — all in one place.
          </p>

          {/* Social Icons row */}
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 pt-2">
            <span className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 cursor-pointer shadow-xs">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
            </span>
            <span className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 cursor-pointer shadow-xs">
              <Instagram className="w-5 h-5 text-rose-500" />
            </span>
            <span className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 cursor-pointer shadow-xs">
              <Linkedin className="w-5 h-5 text-blue-600" />
            </span>
            <span className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 cursor-pointer shadow-xs">
              <Twitter className="w-5 h-5 text-sky-500" />
            </span>
          </div>

          <div className="pt-2">
            <Link
              to="/create-link"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#5850ec] hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all text-base"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right Column Illustration Card matching Page 1 */}
        <div className="flex-1 w-full max-w-lg relative">
          <div className="relative bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Top link mockup */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-mono">
                <Link2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">https://example.com/long-url/product-launch</span>
              </div>

              <div className="flex items-center justify-between gap-2 px-4 py-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm font-mono">
                  linkpulse.com/abc123
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 shadow-xs transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Illustration Graphic Box */}
            <div className="relative bg-gradient-to-b from-indigo-50/50 to-purple-50/30 dark:from-slate-900/60 dark:to-slate-800/40 rounded-2xl p-6 flex items-center justify-between">
              {/* Floating mini stats */}
              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Total Clicks</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-white">1,248</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">QR Scans</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-white">384</div>
                  </div>
                </div>
              </div>

              {/* QR Preview representation */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-24 h-24 bg-slate-950 dark:bg-white rounded-lg p-2 mx-auto flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-white dark:text-slate-950" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-2 block">Scan to visit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards matching Page 1 Bottom */}
      <section className="max-w-7xl mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Shorten Links</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create short, branded links with custom aliases.</p>
          </div>

          <div className="bg-white dark:bg-slate-800/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Track Analytics</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">See clicks, locations, devices, and browser trends.</p>
          </div>

          <div className="bg-white dark:bg-slate-800/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Organize Campaigns</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage links with tags, folders, and status toggles.</p>
          </div>

          <div className="bg-white dark:bg-slate-800/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">QR Codes</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Instant custom QR code generation and PNG downloads.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
