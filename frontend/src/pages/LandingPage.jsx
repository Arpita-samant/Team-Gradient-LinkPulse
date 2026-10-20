import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import HeroIllustration from '../components/HeroIllustration';
import {
  Link2,
  BarChart3,
  QrCode,
  FolderKanban,
  ArrowRight,
  Sun,
  Moon,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  Share2,
  CheckCircle2,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(null);
  const navigate = useNavigate();

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
      setShareFeedback('Opening WhatsApp...');
    } else if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setShareFeedback('Opening X (Twitter)...');
    } else if (platform === 'linkedin') {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setShareFeedback('Opening LinkedIn...');
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(shareUrl);
      setShareFeedback('Link copied to clipboard!');
    }

    setTimeout(() => {
      setShareFeedback(null);
    }, 3000);
  };

  const displayName = user?.name ? user.name.split(' ')[0] : '';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen flex flex-col dot-matrix-bg relative overflow-x-hidden transition-colors duration-150">
      {/* Clean Dot-Matrix Nothing OS Canvas */}

      {/* Header Navigation: Clean, responsive, floating glass pill Nothing OS navbar */}
      <header className="fixed top-4 inset-x-0 z-30 max-w-6xl mx-auto px-4">
        <div className="bg-[var(--glass)] backdrop-blur-xl border border-[var(--line)] rounded-2xl px-4 h-14 flex items-center justify-between gap-4 shadow-2xl">
          {/* Logo with 🔗 emoji */}
          <Link
            to="/"
            className="flex items-center gap-2 text-left focus-visible:outline-2 shrink-0 cursor-pointer"
            title="Link Pulse Home"
          >
            <span className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shrink-0 text-sm">🔗</span>
            <span className="font-ndot text-xs tracking-wider text-[var(--fg)] whitespace-nowrap">
              Link Pulse <span className="text-[var(--accent)]">//</span>
            </span>
          </Link>

          {/* Right Header Actions: Theme Toggle + Log In + Sign Up / User */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="btn btn-line btn-sm"
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline font-ndot text-[11px]">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>

            {/* Authenticated user menu or Log In / Sign Up CTA */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-[var(--accent)] text-white font-mono font-bold text-xs flex items-center justify-center">
                    {initial}
                  </div>
                  <span className="font-mono text-xs text-[var(--fg)] hidden sm:inline">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--fg-muted)]" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--line)] py-1.5 z-50 backdrop-blur-xl animate-in fade-in duration-100 font-mono text-xs">
                    <div className="px-3 py-2 border-b border-[var(--line)]">
                      <p className="font-bold text-[var(--fg)] truncate">{user.name}</p>
                      <p className="text-[10px] text-[var(--fg-muted)] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-[var(--accent)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>SIGN OUT</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-line btn-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-solid btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col justify-center pt-24">
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Hero Text & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              {/* Technical Subheading Tag */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--line)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] led-dot" />
                <span className="font-ndot text-xs text-[var(--fg)]">
                  + <span className="text-[var(--accent)]">URL SHORTENER &amp; ANALYTICS</span>
                </span>
              </div>

              {/* Hero Headline */}
              <h1 className="font-ndot text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] text-[var(--fg)] flex flex-col gap-2 sm:gap-3 lg:gap-3.5">
                <span className="whitespace-nowrap">Shorten Links.</span>
                <span className="whitespace-nowrap">Track Performance.</span>
                <span className="text-[var(--accent)] whitespace-nowrap">Grow Faster.</span>
              </h1>

              {/* Supporting Description */}
              <p className="text-sm sm:text-base lg:text-[17px] text-[var(--fg2)] leading-relaxed font-normal max-w-xl">
                LinkPulse is a powerful URL shortener and analytics platform that helps you create short links, track clicks, manage campaigns, and get valuable insights all in one place.
              </p>

              {/* Prominent CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/create-link"
                  className="btn btn-solid px-6 py-3.5 cursor-pointer text-xs flex items-center gap-2"
                >
                  <span>{user ? "Create a Short Link" : "Get Started Free"}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>

                <Link
                  to="/analytics"
                  className="btn btn-line px-6 py-3.5 cursor-pointer text-xs"
                >
                  <span>{user ? "View Dashboard" : "Explore Dashboard"}</span>
                </Link>
              </div>

              {/* Social Share Controls */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] font-medium">
                  <Share2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Share LinkPulse on:</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleSocialShare('whatsapp')}
                    title="Share on WhatsApp"
                    aria-label="Share on WhatsApp"
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--fg-muted)] transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSocialShare('twitter')}
                    title="Share on X"
                    aria-label="Share on X"
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--fg-muted)] transition-all cursor-pointer"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSocialShare('linkedin')}
                    title="Share on LinkedIn"
                    aria-label="Share on LinkedIn"
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--fg-muted)] transition-all cursor-pointer"
                  >
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSocialShare('instagram')}
                    title="Copy link for Instagram"
                    aria-label="Copy link for Instagram"
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--fg-muted)] transition-all cursor-pointer"
                  >
                    <Instagram className="w-4 h-4" />
                  </button>

                  {shareFeedback && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--accent)] font-ndot text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{shareFeedback}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Animated Hero Illustration with 3D Tilt, Floating & Telemetry */}
            <div className="lg:col-span-6 flex justify-center items-center w-full lg:-mt-8">
              <HeroIllustration theme={theme} />
            </div>
          </div>
        </section>

        {/* 4 Interactive Feature Cards linking to existing dashboard sections */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Card 1: Short Link Generator */}
            <Link
              to="/create-link"
              className="panel p-6 space-y-3 text-left cursor-pointer hover:border-[var(--accent)] transition-colors group block relative"
            >
              <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>

              <Link2 className="w-6 h-6 text-[var(--accent)] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-ndot text-sm text-[var(--fg)] mb-1">Shorten Links</h3>
              <p className="text-xs sm:text-sm text-[var(--fg-muted)]">Create short, branded links with custom aliases.</p>
            </Link>

            {/* Card 2: Track Analytics */}
            <Link
              to="/analytics"
              className="panel p-6 space-y-3 text-left cursor-pointer hover:border-[var(--accent)] transition-colors group block relative"
            >
              <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>

              <BarChart3 className="w-6 h-6 text-[var(--accent)] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-ndot text-sm text-[var(--fg)] mb-1">Track Analytics</h3>
              <p className="text-xs sm:text-sm text-[var(--fg-muted)]">See live clicks, locations, devices, and browser trends.</p>
            </Link>

            {/* Card 3: Link Management */}
            <Link
              to="/links"
              className="panel p-6 space-y-3 text-left cursor-pointer hover:border-[var(--accent)] transition-colors group block relative"
            >
              <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>

              <FolderKanban className="w-6 h-6 text-[var(--accent)] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-ndot text-sm text-[var(--fg)] mb-1">Organize Campaigns</h3>
              <p className="text-xs sm:text-sm text-[var(--fg-muted)]">Manage links with tags, folders, and status toggles.</p>
            </Link>

            {/* Card 4: QR Code Generator */}
            <Link
              to="/qr-generator"
              className="panel p-6 space-y-3 text-left cursor-pointer hover:border-[var(--accent)] transition-colors group block relative"
            >
              <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg3)] group-hover:text-[var(--accent)]">+</span>

              <QrCode className="w-6 h-6 text-[var(--accent)] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-ndot text-sm text-[var(--fg)] mb-1">QR Codes</h3>
              <p className="text-xs sm:text-sm text-[var(--fg-muted)]">Instant custom QR code generation and PNG downloads.</p>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
