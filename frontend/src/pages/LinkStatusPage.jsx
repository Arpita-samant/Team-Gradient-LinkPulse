import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldAlert, PauseCircle, Clock, FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function LinkStatusPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'not-found';
  const code = searchParams.get('code') || '';

  const statusConfig = {
    blocked: {
      icon: ShieldAlert,
      tag: 'SECURITY // HAZARD BLOCKED',
      borderColor: 'border-[#D71921]',
      textColor: 'text-[#D71921]',
      title: 'Malicious Target Intercepted',
      desc: `Short link "/${code}" points toward a destination flagged for malicious activity, phishing, or administrative revocation.`,
      alert: 'Redirection has been terminated by the LinkPulse cryptographic security engine.'
    },
    paused: {
      icon: PauseCircle,
      tag: 'ROUTING // PAUSED',
      borderColor: 'border-amber-500/50',
      textColor: 'text-amber-500',
      title: 'Link Transmission Suspended',
      desc: `The administrator or owner of "/${code}" has paused active traffic distribution.`,
      alert: 'Transmission is offline. Reconnect or contact link owner.'
    },
    expired: {
      icon: Clock,
      tag: 'LIFECYCLE // EXPIRED',
      borderColor: 'border-[var(--line)]',
      textColor: 'text-zinc-400',
      title: 'Link Lifetime Elapsed',
      desc: `The pre-allocated TTL for "/${code}" has expired.`,
      alert: 'This link has ceased routing.'
    },
    'not-found': {
      icon: FileQuestion,
      tag: 'ERROR // 404 NOT FOUND',
      borderColor: 'border-[var(--line)]',
      textColor: 'text-[#D71921]',
      title: 'Route Not Found',
      desc: `No active destination record matches the requested slug "${code}".`,
      alert: 'Verify slug spelling or synthesize a new short link.'
    }
  };

  const current = statusConfig[type] || statusConfig['not-found'];
  const Icon = current.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-black dot-matrix-bg text-black dark:text-white font-mono">
      <div className={`corner-crosshairs-all relative max-w-md w-full bg-white dark:bg-[#0A0A0A] p-8 border ${current.borderColor} shadow-2xl text-center space-y-6`}>
        <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D71921] animate-pulse"></span>
          <span>{current.tag}</span>
        </div>

        <div className={`w-14 h-14 border border-[var(--line)] ${current.textColor} mx-auto flex items-center justify-center`}>
          <Icon className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight font-sans text-black dark:text-white">
            {current.title}
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed font-mono">
            {current.desc}
          </p>
        </div>

        <div className="p-3.5 border border-[var(--line)] bg-zinc-50 dark:bg-black text-xs text-zinc-700 dark:text-zinc-300 font-mono">
          {current.alert}
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="btn-solid inline-flex items-center gap-2 px-6 py-2.5 text-xs font-mono uppercase tracking-widest"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO LINKPULSE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
