import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { linkAPI } from '../services/api';
import { Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function PasswordPromptPage() {
  const { shortCode } = useParams();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('error') ? 'Incorrect password. Please try again.' : null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    try {
      setLoading(true);
      setError(null);
      const res = await linkAPI.verifyPassword(shortCode, password);
      if (res.success && res.originalUrl) {
        window.location.href = res.originalUrl;
      }
    } catch (err) {
      setError(err.message || 'Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-black dot-matrix-bg text-black dark:text-white font-mono">
      <div className="corner-crosshairs-all relative max-w-md w-full bg-white dark:bg-[#0A0A0A] p-8 border border-[var(--line)] shadow-2xl space-y-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D71921] animate-pulse"></span>
          <span>SECURITY CHALLENGE</span>
        </div>

        <div className="w-14 h-14 border border-[var(--line)] text-[#D71921] mx-auto flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight font-sans text-black dark:text-white">
            Encrypted Link Target
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Destination <span className="font-bold text-[#D71921]">/{shortCode}</span> enforces passphrase clearance.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-[#D71921]/40 text-[#D71921] text-xs font-mono flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left font-mono">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold uppercase tracking-wider text-black dark:text-white">
                Passphrase Required
              </label>
              <span className="text-zinc-500">[KEY]</span>
            </div>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 text-xs bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white focus:outline-none focus:border-[#D71921]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-solid w-full py-3 px-6 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'AUTHORIZE INGRESS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-[10px] text-zinc-500 uppercase flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D71921]" />
          <span>LINKPULSE // CRYPTOGRAPHIC GATEWAY</span>
        </div>
      </div>
    </div>
  );
}
