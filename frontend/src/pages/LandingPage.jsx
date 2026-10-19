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
  ShieldAlert,
  Share2
} from 'lucide-react';

export default function LandingPage() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(null);
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

  const handleSocialShare = (platform) => {
    const shareUrl = window.location.origin;
    const shareText = 'Check out LinkPulse — A fast URL Shortener, QR Code Generator, and Real-Time Analytics platform!';

    if (platform === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setShareFeedback('Opening WhatsApp to share LinkPulse...');
    } else if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setShareFeedback('Opening X (Twitter) to share LinkPulse...');
    } else if (platform === 'linkedin') {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setShareFeedback('Opening LinkedIn to share LinkPulse...');
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(shareUrl);
      setShareFeedback('Platform link copied to clipboard! Paste into your Instagram Bio or Story.');
    }

    setTimeout(() => {
      setShareFeedback(null);
    }, 3500);
  };

  const displayName = user?.name ? user.name.split(' ')[0] : '';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#08080a] text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-red-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 dark:bg-red-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-rose-600/10 dark:bg-rose-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850/60">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Link2 className="w-5 h-5 -rotate-45" />
          </div>
          <span className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight">
            LinkPulse
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                <span className="text-xs font-semibold hidden sm:inline text-zinc-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-zinc-800 hover:-rotate-12 transition-transform" />
                <span className="text-xs font-semibold hidden sm:inline text-zinc-700">Dark</span>
              </>
            )}
          </button>

          {/* User profile ONLY shown after login / signup */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {initial}
                </div>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hidden sm:inline">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121217] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAdmin ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {isAdmin ? 'System Administrator' : 'Member'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/analytics"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <span>My Analytics Dashboard</span>
                    </Link>

                    <Link
                      to="/create-link"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <Link2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <span>Create Short Link</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer transition-colors"
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
                className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-lg shadow-red-600/25 active:scale-95 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Standard max-w-7xl page width */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10">
        {/* Left Column Content - Finely Balanced */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left z-10 max-w-xl mx-auto lg:mx-0">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.18]">
            <span className="whitespace-nowrap inline-block">Shorten Links.</span>
            <br />
            <span className="whitespace-nowrap inline-block">Track Performance.</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-400 bg-clip-text text-transparent whitespace-nowrap inline-block">Grow Faster.</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-[17px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            LinkPulse is a powerful URL shortener and analytics platform that helps you create short links,
            track clicks, manage campaigns, and get valuable insights all in one place.
          </p>

          {/* Social Share Options */}
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <Share2 className="w-3.5 h-3.5 text-red-500" />
              <span>Share LinkPulse on:</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-3.5 text-zinc-600 dark:text-zinc-300">
              <button
                onClick={() => handleSocialShare('whatsapp')}
                title="Share on WhatsApp"
                aria-label="Share on WhatsApp"
                className="p-2.5 sm:p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs hover:shadow-emerald-500/20"
              >
                <MessageCircle className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400" />
              </button>
              <button
                onClick={() => handleSocialShare('instagram')}
                title="Share on Instagram"
                aria-label="Share on Instagram"
                className="p-2.5 sm:p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs hover:shadow-rose-500/20"
              >
                <Instagram className="w-4.5 h-4.5 text-rose-500 dark:text-rose-400" />
              </button>
              <button
                onClick={() => handleSocialShare('linkedin')}
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
                className="p-2.5 sm:p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs hover:shadow-blue-500/20"
              >
                <Linkedin className="w-4.5 h-4.5 text-blue-500 dark:text-blue-400" />
              </button>
              <button
                onClick={() => handleSocialShare('twitter')}
                title="Share on X (Twitter)"
                aria-label="Share on X (Twitter)"
                className="p-2.5 sm:p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-sky-500 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs hover:shadow-sky-500/20"
              >
                <Twitter className="w-4.5 h-4.5 text-sky-500 dark:text-sky-400" />
              </button>
            </div>

            {/* Inline feedback notification for social sharing */}
            {shareFeedback && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-300 text-xs font-medium animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" />
                <span>{shareFeedback}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              to={user ? "/create-link" : "/signup"}
              className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base cursor-pointer"
            >
              <span>{user ? 'Create a Short Link' : 'Get Started Free'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Only the image itself is enlarged */}
        <div className="lg:col-span-6 w-full relative flex items-center justify-center py-4 lg:py-6">
          {/* Radial Pulse Red Glow Backdrop focused behind the image */}
          <div className="absolute w-72 h-72 sm:w-[480px] sm:h-[480px] lg:w-[620px] lg:h-[620px] xl:w-[720px] xl:h-[720px] bg-gradient-to-tr from-red-600/35 via-rose-500/25 to-red-400/15 rounded-full blur-[100px] pointer-events-none animate-pulse -z-10" />

          {/* Transparent Illustration with enlarged scale and red drop-shadow */}
          <div className="relative group select-none flex items-center justify-center w-full animate-float">
            <img
              src="/hero-illustration.png"
              alt="LinkPulse Mascot — Short Links, QR Codes and Live Analytics"
              className="w-full max-w-none sm:scale-110 lg:scale-125 xl:scale-135 2xl:scale-140 h-auto object-contain drop-shadow-[0_25px_60px_rgba(239,68,68,0.48)] hover:drop-shadow-[0_40px_85px_rgba(239,68,68,0.7)] transition-all duration-500 hover:scale-[1.15] lg:hover:scale-[1.32] xl:hover:scale-[1.42] cursor-pointer origin-center"
            />
          </div>
        </div>
      </section>

      {/* 4 Feature Cards */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-md hover:border-red-500/50 hover:shadow-red-950/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">Shorten Links</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Create short, branded links with custom aliases.</p>
          </div>

          <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-md hover:border-red-500/50 hover:shadow-red-950/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">Track Analytics</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">See live clicks, locations, devices, and browser trends.</p>
          </div>

          <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-md hover:border-red-500/50 hover:shadow-red-950/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">Organize Campaigns</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Manage links with tags, folders, and status toggles.</p>
          </div>

          <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-md hover:border-red-500/50 hover:shadow-red-950/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">QR Codes</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Instant custom QR code generation and PNG downloads.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
