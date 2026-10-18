import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Link2,
  QrCode,
  FolderKanban,
  BarChart3,
  ShieldAlert,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/create-link', label: 'Short Link', icon: Link2 },
    { to: '/qr-generator', label: 'QR Code Generator', icon: QrCode },
    { to: '/links', label: 'Link Management', icon: FolderKanban },
    { to: '/analytics', label: 'Analytics Dashboard', icon: BarChart3 },
  ];

  // Strictly only show Admin Panel if user is logged in AND role is admin
  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert, badge: 'Admin' });
  }

  const content = (
    <div className="w-64 h-full bg-[#111827] text-slate-300 flex flex-col select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Link2 className="w-5 h-5 -rotate-45" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">LinkPulse</span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info Card */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Pulse Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Base62 NanoID shortening, custom QR codes, and live analytics per user account.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="hidden lg:flex shrink-0 min-h-screen">
        {content}
      </aside>

      {/* Mobile drawer with backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-50 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
