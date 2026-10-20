import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Link2,
  QrCode,
  FolderKanban,
  ShieldAlert,
  X,
  Home
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, code: '00' },
    { to: '/analytics', label: 'Analytic Dashboard', icon: BarChart3, code: '01' },
    { to: '/create-link', label: 'Short Link Generator', icon: Link2, code: '02' },
    { to: '/qr-generator', label: 'QR Code Generator', icon: QrCode, code: '03' },
    { to: '/links', label: 'Link Management', icon: FolderKanban, code: '04' },
  ];

  // Strictly only show Admin Panel if user is logged in AND role is admin
  if (isAdmin) {
    navItems.push({
      to: '/admin',
      label: 'Admin Panel',
      icon: ShieldAlert,
      code: 'ADM',
      badge: 'ROOT'
    });
  }

  const content = (
    <div className="w-64 h-full bg-[var(--glass)] backdrop-blur-xl text-[var(--fg)] flex flex-col select-none border-r border-[var(--line)] transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--line)]">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <span className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors">
            <Link2 className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <span className="font-ndot text-xs tracking-wider text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
              Link Pulse <span className="text-[var(--accent)]">//</span>
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg border border-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg-muted)] cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 font-ndot text-[10px] tracking-widest text-[var(--fg3)] uppercase">
          NAVIGATION //
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-ndot transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[var(--fg)] text-[var(--bg)] font-semibold shadow-md'
                    : 'text-[var(--fg2)] hover:bg-[var(--surface)] hover:text-[var(--fg)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[var(--bg)]' : 'text-[var(--fg3)]'
                  }`} />

                  <span className="flex-1 truncate tracking-tight">{item.label}</span>

                  {item.badge ? (
                    <span className={`font-ndot text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                      isActive ? 'border-[var(--bg)] text-[var(--bg)]' : 'border-[var(--accent)] text-[var(--accent)]'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer telemetry */}
      <div className="p-4 border-t border-[var(--line)] font-mono text-[10px] text-[var(--fg-dim)]">
        <div className="flex items-center justify-between">
          <span className="uppercase tracking-wider">ENGINE</span>
          <span className="text-[var(--accent)] font-bold">ONLINE</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="uppercase tracking-wider">STATUS</span>
          <span>v2.4.0 MONO</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="hidden lg:flex shrink-0 min-h-screen z-20">
        {content}
      </aside>

      {/* Mobile drawer with backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
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
