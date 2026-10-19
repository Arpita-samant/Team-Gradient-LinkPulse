import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import {
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
  Plus,
  BarChart2
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

  const firstName = user?.name ? user.name.split(' ')[0] : 'Member';

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

  // Strictly live data with 0 as initial defaults for new users
  const stats = data?.stats || {
    totalLinks: 0,
    linksGrowth: '0%',
    totalClicks: 0,
    clicksGrowth: '0%',
    totalQR: 0,
    qrGrowth: '0%',
    totalScans: 0,
    scansGrowth: '0%'
  };

  const chartData = data?.clickTrends || [];
  const topLinks = data?.topPerforming || [];
  const deviceBreakdown = data?.deviceBreakdown || [];
  const browserBreakdown = data?.browserBreakdown || [];
  const referrerBreakdown = data?.referrerBreakdown || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1">
            Here's what's happening with your links today.
          </p>
        </div>

        {/* Date Filter pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs font-semibold text-zinc-700 dark:text-zinc-300 self-start sm:self-auto transition-colors">
          <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <span>Live Pulse Period ({range === '30d' ? 'Last 30 Days' : 'Last 7 Days'})</span>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Links */}
        <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-3 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Links</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <FolderKanbanIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {stats.totalLinks}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ {stats.linksGrowth}</span>
            <span className="text-zinc-500 font-normal">activity</span>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-3 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Clicks</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {stats.totalClicks?.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ {stats.clicksGrowth}</span>
            <span className="text-zinc-500 font-normal">activity</span>
          </div>
        </div>

        {/* Total QR */}
        <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-3 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total QR</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {stats.totalQR}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ {stats.qrGrowth}</span>
            <span className="text-zinc-500 font-normal">activity</span>
          </div>
        </div>

        {/* Total Scans */}
        <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-3 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Scans</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {stats.totalScans}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ {stats.scansGrowth}</span>
            <span className="text-zinc-500 font-normal">activity</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Top Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Click Trends (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#121217] p-5 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                Click Trends
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Live click traffic on your links over the last {range === '30d' ? '30 days' : '7 days'}
              </p>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setRange('7d')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  range === '7d'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setRange('30d')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  range === '30d'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#181820] border border-zinc-750 text-white px-3 py-2 rounded-xl text-xs shadow-2xl space-y-1">
                          <p className="font-semibold">{payload[0].payload.date}</p>
                          <p className="text-red-400 font-mono">Clicks: {payload[0].value}</p>
                          {payload[0].payload.scans !== undefined && (
                            <p className="text-emerald-400 font-mono">QR Scans: {payload[0].payload.scans}</p>
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
                  stroke="#ef4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#clickGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Top Performing Links (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#121217] p-5 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-red-500" />
              Top Performing Links
            </h2>
            {topLinks.length > 0 && (
              <RouterLink
                to="/links"
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                View All
              </RouterLink>
            )}
          </div>

          {topLinks.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-500 mx-auto flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                You haven't created any links yet. Start shortening to view performance!
              </p>
              <RouterLink
                to="/create-link"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-md shadow-red-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Short Link</span>
              </RouterLink>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <tr>
                    <th className="py-2.5 font-medium">Link</th>
                    <th className="py-2.5 font-medium text-center">Clicks</th>
                    <th className="py-2.5 font-medium text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                  {topLinks.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
                      <td className="py-3 font-mono font-medium text-red-500 truncate max-w-[170px]">
                        <a href={item.fullShortUrl} target="_blank" rel="noreferrer" className="hover:underline">
                          {item.shortUrl}
                        </a>
                      </td>
                      <td className="py-3 font-semibold text-zinc-800 dark:text-zinc-200 text-center">
                        {item.clicks}
                      </td>
                      <td className="py-3 font-semibold text-emerald-500 text-right">
                        ↑ {item.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Device & Technology Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
            <Monitor className="w-4 h-4 text-red-500" />
            <span>Device Breakdown</span>
          </div>

          <div className="space-y-3">
            {deviceBreakdown.length > 0 && stats.totalClicks > 0 ? (
              deviceBreakdown.map((dev) => (
                <div key={dev.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      {dev.name === 'Desktop' && <Monitor className="w-3.5 h-3.5 text-zinc-400" />}
                      {dev.name === 'Mobile' && <Smartphone className="w-3.5 h-3.5 text-zinc-400" />}
                      {dev.name === 'Tablet' && <Tablet className="w-3.5 h-3.5 text-zinc-400" />}
                      {dev.name}
                    </span>
                    <span>{dev.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-rose-600 rounded-full transition-all duration-500"
                      style={{ width: `${dev.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">
                No device clicks recorded yet.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Top Browsers</span>
          </div>

          <div className="space-y-2.5">
            {browserBreakdown.length > 0 ? (
              browserBreakdown.map(b => (
                <div key={b.name} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
                  <span className="text-zinc-700 dark:text-zinc-300">{b.name}</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{b.pct}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">
                No browser data logged yet.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
            <ArrowUpRight className="w-4 h-4 text-red-500" />
            <span>Top Referrers</span>
          </div>

          <div className="space-y-2.5">
            {referrerBreakdown.length > 0 ? (
              referrerBreakdown.map(r => (
                <div key={r.name} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
                  <span className="text-zinc-700 dark:text-zinc-300">{r.name}</span>
                  <span className="font-semibold text-red-500">{r.clicks} clicks</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">
                No referrer data available yet.
              </p>
            )}
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
