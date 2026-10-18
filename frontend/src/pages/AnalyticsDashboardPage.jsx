import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import {
  BarChart3,
  Link2,
  QrCode,
  Scan,
  TrendingUp,
  Calendar,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Arpita';

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const fetchAnalytics = async (selectedRange) => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getDashboard(selectedRange);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    totalLinks: 24,
    linksGrowth: '+8%',
    totalClicks: 1248,
    clicksGrowth: '+16%',
    totalQR: 12,
    qrGrowth: '+16%',
    totalScans: 384,
    scansGrowth: '+14%'
  };

  const chartData = data?.clickTrends || [];
  const topLinks = data?.topPerforming || [];
  const deviceBreakdown = data?.deviceBreakdown || [];

  return (
    <div className="space-y-8">
      {/* Top Header matching Page 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good Morning, {firstName}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Here's what's happening with your links today.
          </p>
        </div>

        {/* Date Filter pill matching Page 5 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs text-xs font-semibold text-slate-700 dark:text-slate-200 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Oct 10, 2025 — Oct 16, 2025</span>
        </div>
      </div>

      {/* 4 KPI Metric Cards matching Page 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Links */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Links</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#5850ec] flex items-center justify-center">
              <FolderKanbanIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalLinks}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ {stats.linksGrowth}</span>
            <span className="text-slate-400 font-normal">vs. last week</span>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Clicks</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalClicks?.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ {stats.clicksGrowth}</span>
            <span className="text-slate-400 font-normal">vs. last week</span>
          </div>
        </div>

        {/* Total QR */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total QR</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalQR}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ {stats.qrGrowth}</span>
            <span className="text-slate-400 font-normal">vs. last week</span>
          </div>
        </div>

        {/* Total Scans */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Scans</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalScans}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ {stats.scansGrowth}</span>
            <span className="text-slate-400 font-normal">vs. last week</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Top Links Section matching Page 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Click Trends (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Click Trends
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Total clicks on your links over the last {range === '30d' ? '30 days' : '7 days'}
              </p>
            </div>

            {/* Time Filter Pills matching Page 5 */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setRange('7d')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  range === '7d'
                    ? 'bg-[#5850ec] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setRange('30d')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  range === '30d'
                    ? 'bg-[#5850ec] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setRange('7d')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  range === 'custom'
                    ? 'bg-[#5850ec] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5850ec" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5850ec" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl space-y-1">
                          <p className="font-semibold">{payload[0].payload.date}</p>
                          <p className="text-indigo-300 font-mono">Clicks: {payload[0].value}</p>
                          {payload[0].payload.scans !== undefined && (
                            <p className="text-emerald-300 font-mono">QR Scans: {payload[0].payload.scans}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#5850ec"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#clickGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Top Performing Links (5 cols) matching Page 5 */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-indigo-500" />
              Top Performing Links
            </h2>
            <RouterLink
              to="/links"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </RouterLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-2">
                <tr>
                  <th className="py-2.5 font-medium">Link</th>
                  <th className="py-2.5 font-medium text-center">Clicks</th>
                  <th className="py-2.5 font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {topLinks.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                    <td className="py-3 font-mono font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[170px]">
                      <a href={`http://localhost:5000/${item.shortCode}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {item.shortUrl}
                      </a>
                    </td>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 text-center">
                      {item.clicks}
                    </td>
                    <td className="py-3 font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                      ↑ {item.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Device & Technology Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Monitor className="w-4 h-4 text-indigo-500" />
            <span>Device Breakdown</span>
          </div>

          <div className="space-y-3">
            {deviceBreakdown.map((dev) => (
              <div key={dev.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    {dev.name === 'Desktop' && <Monitor className="w-3.5 h-3.5 text-slate-400" />}
                    {dev.name === 'Mobile' && <Smartphone className="w-3.5 h-3.5 text-slate-400" />}
                    {dev.name === 'Tablet' && <Tablet className="w-3.5 h-3.5 text-slate-400" />}
                    {dev.name}
                  </span>
                  <span>{dev.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5850ec] rounded-full transition-all duration-500"
                    style={{ width: `${dev.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Top Browsers</span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Google Chrome', pct: '64%' },
              { name: 'Apple Safari', pct: '20%' },
              { name: 'Mozilla Firefox', pct: '10%' },
              { name: 'Microsoft Edge', pct: '6%' }
            ].map(b => (
              <div key={b.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
                <span className="text-slate-600 dark:text-slate-300">{b.name}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{b.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
            <span>Top Referrers</span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Direct / Bookmarks', clicks: 512 },
              { name: 'Google Search', clicks: 340 },
              { name: 'Twitter / X', clicks: 210 },
              { name: 'LinkedIn Posts', clicks: 186 }
            ].map(r => (
              <div key={r.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
                <span className="text-slate-600 dark:text-slate-300">{r.name}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{r.clicks} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderKanbanIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
      <path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>
    </svg>
  );
}
