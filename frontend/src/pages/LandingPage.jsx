import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  TrendingUp,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  ChevronDown,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export default function LandingPage() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText('https://linkpulse.com/abc123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const displayName = user?.name ? user.name.split(' ')[0] : '';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Link2 className="w-5 h-5 -rotate-45" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
            LinkPulse
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User profile ONLY shown after login / signup */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#1e293b] dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#4f46e5]/20 shadow-xs">
                  {initial}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    }`}>
                      {isAdmin ? 'System Administrator' : 'Member'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/analytics"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <span>My Analytics Dashboard</span>
                    </Link>

                    <Link
                      to="/create-link"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
                    >
                      <Link2 className="w-4 h-4 text-slate-400" />
                      <span>Create Short Link</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest visitor: Strictly Login & Sign Up buttons */
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#5850ec] hover:bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
        {/* Left Column Content */}
        <div className="flex-1 max-w-xl space-y-6 text-center lg:text-left">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Shorten Links.<br />
            Track Performance.<br />
            <span className="text-[#5850ec] dark:text-indigo-400">Grow Faster.</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-lg mx-auto lg:mx-0">
            LinkPulse is a powerful URL shortener and analytics platform that helps you create short links,
            track clicks, manage campaigns, and get valuable insights — all in one place.
          </p>

          {/* Social Icons row */}
          <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 text-slate-700 dark:text-slate-300 pt-1">
            <span className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 cursor-pointer shadow-xs">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
            </span>
            <span className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 cursor-pointer shadow-xs">
              <Instagram className="w-5 h-5 text-rose-500" />
            </span>
            <span className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 cursor-pointer shadow-xs">
              <Linkedin className="w-5 h-5 text-blue-600" />
            </span>
            <span className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 cursor-pointer shadow-xs">
              <Twitter className="w-5 h-5 text-sky-500" />
            </span>
          </div>

          <div className="pt-2">
            <Link
              to={user ? "/create-link" : "/signup"}
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 bg-[#5850ec] hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all text-sm sm:text-base cursor-pointer"
            >
              <span>{user ? 'Create a Short Link' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>

        {/* Right Column Illustration Card */}
        <div className="flex-1 w-full max-w-lg relative">
          <div className="relative bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Top link mockup */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-slate-100 dark:bg-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-mono truncate">
                <Link2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">https://example.com/long-url/product-launch</span>
              </div>

              <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-mono truncate">
                  linkpulse.com/abc123
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 shadow-xs transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Illustration Graphic Box */}
            <div className="relative bg-gradient-to-b from-indigo-50/50 to-purple-50/30 dark:from-slate-900/60 dark:to-slate-800/40 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Floating mini stats */}
              <div className="space-y-3 w-full sm:w-auto">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Total Clicks</div>
                    <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">1,248</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">QR Scans</div>
                    <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">384</div>
                  </div>
                </div>
              </div>

              {/* QR Preview representation */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center w-full sm:w-auto">
                <div className="w-24 h-24 bg-slate-950 dark:bg-white rounded-lg p-2 mx-auto flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-white dark:text-slate-950" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-2 block">Scan to visit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-800/70 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Shorten Links</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Create short, branded links with custom aliases.</p>
          </div>

          <div className="bg-white dark:bg-slate-800/70 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Track Analytics</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">See live clicks, locations, devices, and browser trends.</p>
          </div>

          <div className="bg-white dark:bg-slate-800/70 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Organize Campaigns</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage links with tags, folders, and status toggles.</p>
          </div>

          <div className="bg-white dark:bg-slate-800/70 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">QR Codes</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Instant custom QR code generation and PNG downloads.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
