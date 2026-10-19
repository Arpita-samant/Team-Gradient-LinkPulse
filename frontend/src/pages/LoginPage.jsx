import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Link2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
      navigate('/analytics');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemo = async () => {
    try {
      setLoading(true);
      setError(null);
      await login('samantarpita70@gmail.com', 'arpitasamant12');
      navigate('/analytics');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setForgotModalOpen(false);
      setForgotEmail('');
    }, 2800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 dot-matrix-bg bg-[var(--bg)] text-[var(--fg)] relative selection:bg-[var(--accent)] selection:text-white transition-colors duration-150">
      {/* Return to Home link */}
      <Link
        to="/"
        className="absolute top-6 left-6 font-ndot text-xs text-[var(--fg-muted)] hover:text-[var(--accent)] flex items-center gap-2 transition-colors cursor-pointer"
      >
        <span>← RETURN // HOME</span>
      </Link>

      <div className="relative max-w-md w-full panel p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
        {/* Crosshair corners */}
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>

        {/* Header indicator bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] led-dot" />
            <span className="font-ndot text-xs text-[var(--fg2)]">
              <span className="text-[var(--accent)]">Auth //</span> Operator Login
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            aria-label="Close"
            title="Return to Home"
            className="p-1 rounded-md text-[var(--fg3)] hover:text-[var(--fg)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-ndot text-2xl text-[var(--fg)]">
            Login
          </h1>
          <p className="text-xs text-[var(--fg2)] font-mono">
            INPUT CREDENTIALS TO ACCESS TELEMETRY
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)] text-xs flex items-center gap-2.5 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="input"
              />
              <Mail className="w-4 h-4 text-[var(--fg3)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block font-ndot text-[11px] text-[var(--fg)]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="font-ndot text-[10px] text-[var(--accent)] hover:underline transition-colors cursor-pointer"
              >
                FORGOT PASSWORD?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--fg3)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded-xs accent-[var(--accent)] border-[var(--line)] bg-[var(--bg)] cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-xs text-[var(--fg2)] font-mono cursor-pointer">
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-solid w-full py-4 text-xs cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'LOGIN'}</span>
            <ArrowRight className="w-4 h-4 text-[var(--accent)]" />
          </button>
        </form>

        {/* 1-Click Demo Button for Admin */}
        <div className="pt-3 border-t border-[var(--line)] space-y-2">
          <p className="text-[10px] font-ndot text-center text-[var(--fg3)]">
            ADMINISTRATOR ROOT ACCESS
          </p>
          <button
            type="button"
            onClick={handleAdminDemo}
            disabled={loading}
            className="btn btn-line w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>1-CLICK DEMO ACCESS (ROOT)</span>
          </button>
        </div>

        <div className="text-center font-ndot text-[11px] text-[var(--fg3)]">
          DON'T HAVE AN ACCOUNT?{' '}
          <Link to="/signup" className="text-[var(--accent)] hover:underline">
            CREATE ACCOUNT →
          </Link>
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative max-w-sm w-full nothing-panel corner-crosshairs-all p-6 rounded-sm shadow-2xl space-y-4">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-[var(--fg-dim)] hover:text-[var(--fg)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-widest font-bold">
                RECOVERY // PASSWORD
              </span>
              <h2 className="text-base font-bold text-[var(--fg)]">Password Recovery</h2>
              <p className="text-xs text-[var(--fg-muted)] font-mono">
                Enter your registered @gmail.com email to receive instructions.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="p-3 rounded-xs border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-mono text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Recovery instructions sent to email.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3 font-mono text-xs">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3 py-2 rounded-sm bg-[var(--surface-subtle)] border border-[var(--line)] text-[var(--fg)] placeholder-[var(--fg-dim)] focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  className="btn-solid w-full py-2.5 rounded-sm uppercase tracking-wider text-xs"
                >
                  DISPATCH RECOVERY
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
