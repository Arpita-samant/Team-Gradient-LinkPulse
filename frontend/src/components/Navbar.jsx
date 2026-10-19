import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  ShieldAlert,
  Menu,
  BarChart3,
  Link2
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Guest';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#08080a]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 gap-3">
        {/* Left: Mobile hamburger menu button */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 active:scale-[0.98] transition-all cursor-pointer"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Minimal breadcrumb / title badge on mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-sm shadow-red-600/30">
              <Link2 className="w-3.5 h-3.5 -rotate-45" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">LinkPulse</span>
          </div>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center space-x-2 sm:space-x-3">
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
                <span className="text-xs font-semibold hidden md:inline text-zinc-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-zinc-800 hover:-rotate-12 transition-transform" />
                <span className="text-xs font-semibold hidden md:inline text-zinc-700">Dark</span>
              </>
            )}
          </button>

          {/* User Profile Dropdown ONLY shown when logged in */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs font-mono">
                  {initial}
                </div>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hidden sm:inline">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121217] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate">{user.email}</p>
                    <span className={`inline-block mt-1.5 text-[9px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                      isAdmin
                        ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800/80'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                    }`}>
                      {isAdmin ? 'Administrator' : 'Member'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/analytics"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <span>My Analytics</span>
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
            /* Guest visitor: Show Login & Sign Up */
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] rounded-xl shadow-md shadow-red-600/30 transition-all"
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
