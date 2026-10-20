import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Menu,
  ShieldAlert
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = (path) => {
    switch (path) {
      case '/analytics': return 'TELEMETRY // ANALYTIC DASHBOARD';
      case '/create-link': return 'SHORT LINK // GENERATOR';
      case '/qr-generator': return 'MATRIX // QR GENERATOR';
      case '/links': return 'INVENTORY // LINK MANAGEMENT';
      case '/admin': return 'ROOT // ADMINISTRATIVE CONTROLS';
      default: return 'CONSOLE';
    }
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'User';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--line)] transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 gap-3">
        {/* Left: Mobile hamburger + Active module title */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-sm border border-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg-muted)] cursor-pointer"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse hidden sm:inline-block" />
            <span className="font-mono text-xs tracking-wider uppercase text-[var(--fg)] font-semibold">
              {getPageTitle(location.pathname)}
            </span>
          </div>
        </div>

        {/* Right Nav Controls: Theme Toggle + User Dropdown */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-sm border border-[var(--line)] bg-[var(--surface-subtle)] text-[var(--fg)] hover:border-[var(--fg-muted)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-white hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-black hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* User Profile Dropdown / Guest Auth CTA */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-sm border border-[var(--line)] bg-[var(--surface-subtle)] hover:border-[var(--fg-muted)] transition-all cursor-pointer font-mono"
              >
                <div className="w-6 h-6 rounded-xs bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center">
                  {initial}
                </div>
                <span className="text-xs text-[var(--fg)] hidden sm:inline font-medium">
                  {displayName}
                </span>
                <ChevronDown className="w-3 h-3 text-[var(--fg-muted)]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] rounded-sm shadow-2xl border border-[var(--line)] py-2 z-50 backdrop-blur-xl animate-in fade-in duration-100 font-mono text-xs">
                  <div className="px-3.5 py-2 border-b border-[var(--line)]">
                    <p className="font-bold text-[var(--fg)] truncate">{user.name}</p>
                    <p className="text-[10px] text-[var(--fg-muted)] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs border border-[var(--line)] text-[var(--fg-muted)]">
                      ROLE // {isAdmin ? 'ADMINISTRATOR' : 'MEMBER'}
                    </span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-[var(--accent)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>SIGN OUT</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 font-mono text-xs">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-sm border border-[var(--line)] bg-[var(--surface-subtle)] text-[var(--fg)] hover:border-[var(--fg-muted)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 rounded-sm border border-transparent bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 transition-all cursor-pointer font-bold text-xs uppercase tracking-wider"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
