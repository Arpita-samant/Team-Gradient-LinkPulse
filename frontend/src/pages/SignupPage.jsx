import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Link2,
  ArrowRight,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password Strength Calculation (0 to 4)
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthLabels = ['EMPTY', 'WEAK', 'FAIR', 'STRONG', 'SECURE'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Strict @gmail.com check
    const trimmedEmail = email.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(trimmedEmail)) {
      setError('Please provide a valid @gmail.com email address (e.g. name@gmail.com).');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), trimmedEmail, password);
      navigate('/analytics');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <span className="text-[var(--accent)]">Auth //</span> Create Account
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
          <div className="flex items-center justify-between">
            <h1 className="font-ndot text-2xl text-[var(--fg)]">
              Sign Up
            </h1>
            <Link
              to="/login"
              className="font-ndot text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
            >
              Have account? Login
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)] text-xs flex items-center gap-2.5 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="input"
            />
          </div>

          {/* Email Address */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block font-ndot text-[11px] text-[var(--fg)]">
                Email Address
              </label>
              <span className="font-ndot text-[10px] text-[var(--accent)]">REQUIRED: @GMAIL.COM</span>
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              className="input"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block font-ndot text-[11px] text-[var(--fg)]">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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

            {/* Password strength mini gauge */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className="h-1.5 rounded-full transition-colors duration-200"
                      style={{ backgroundColor: strength >= step ? 'var(--fg)' : 'var(--line)' }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] font-ndot text-[var(--fg3)]">
                  <span>STRENGTH</span>
                  <span className="text-[var(--fg2)]">{strengthLabels[strength]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="input"
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="rememberMeSignup"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded-xs accent-[var(--accent)] border-[var(--line)] bg-[var(--bg)] cursor-pointer"
            />
            <label htmlFor="rememberMeSignup" className="text-xs text-[var(--fg2)] font-mono cursor-pointer">
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-solid w-full py-4 text-xs cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'ENROLLING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
            <ArrowRight className="w-4 h-4 text-[var(--accent)]" />
          </button>
        </form>

        <div className="text-center font-ndot text-[11px] text-[var(--fg3)] pt-2 border-t border-[var(--line)]">
          ALREADY REGISTERED?{' '}
          <Link to="/login" className="text-[var(--accent)] hover:underline">
            SIGN IN HERE →
          </Link>
        </div>
      </div>
    </div>
  );
}
