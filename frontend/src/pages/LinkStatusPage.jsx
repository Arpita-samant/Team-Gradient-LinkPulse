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
      iconColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60',
      title: 'Malicious / Suspicious Link Blocked',
      desc: `The shortened link "/${code}" targets a destination flagged as hazardous, phishing, or blocked by LinkPulse security administrators.`,
      alert: 'Redirection has been terminated to safeguard your device and data.'
    },
    paused: {
      icon: PauseCircle,
      iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
      title: 'Link Temporarily Paused',
      desc: `The owner of "/${code}" has paused this campaign. It is not currently accepting visitors.`,
      alert: 'Please check back later or contact the link creator.'
    },
    expired: {
      icon: Clock,
      iconColor: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
      title: 'Link Has Expired',
      desc: `The link "/${code}" had a predetermined lifetime that has elapsed.`,
      alert: 'This link is no longer active.'
    },
    'not-found': {
      icon: FileQuestion,
      iconColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
      title: 'Short Link Not Found',
      desc: `We could not find any active short link with the code "${code}".`,
      alert: 'Check the URL spelling or generate a new link.'
    }
  };

  const current = statusConfig[type] || statusConfig['not-found'];
  const Icon = current.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700/80 text-center space-y-6">
        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${current.iconColor}`}>
          <Icon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {current.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {current.desc}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          {current.alert}
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-[#5850ec] hover:bg-indigo-600 transition-all text-xs shadow-md shadow-indigo-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Go to LinkPulse Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
