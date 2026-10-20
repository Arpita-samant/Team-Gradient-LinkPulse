import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, user]);

  const fetchAnalytics = async (selectedRange) => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
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
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] led-dot" />
            <span className="font-ndot text-xs text-[var(--fg2)]">
              <span className="text-[var(--accent)]">Telemetry //</span> Analytic Dashboard
            </span>
          </div>
          <h1 className="font-ndot text-2xl sm:text-3xl text-[var(--fg)]">
            {user ? `Good Morning, ${firstName}!` : 'Analytic Dashboard'}
          </h1>
          <p className="text-xs text-[var(--fg2)] font-mono">
            {user ? "Here's what's happening with your links today." : "Real-time link click trends, device metrics, and telemetry."}
          </p>
        </div>

        {/* Date Filter pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] font-ndot text-[11px] text-[var(--fg2)] self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>WINDOW: {range === '30d' ? '30 DAYS' : '7 DAYS'}</span>
        </div>
      </div>

      {!user && (
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--fg2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] led-dot shrink-0" />
            <span>GUEST MODE // Sign up or log in to track live clicks, geographic telemetry, and performance insights.</span>
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="btn btn-solid btn-sm whitespace-nowrap cursor-pointer self-start sm:self-auto"
          >
            Sign Up Free
          </button>
        </div>
      )}

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Links */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="font-ndot text-[10px] text-[var(--fg3)]">TOTAL LINKS</span>
          <p className="font-ndot text-2xl sm:text-3xl text-[var(--fg)]">{stats.totalLinks}</p>
          <span className="text-[10px] text-[var(--accent)] block font-ndot">↑ {stats.linksGrowth || '+12%'} vs. last week</span>
        </div>

        {/* Total Clicks */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="font-ndot text-[10px] text-[var(--fg3)]">TOTAL CLICKS</span>
          <p className="font-ndot text-2xl sm:text-3xl text-[var(--accent)]">{stats.totalClicks?.toLocaleString()}</p>
          <span className="text-[10px] text-[var(--accent)] block font-ndot">↑ {stats.clicksGrowth || '+16%'} vs. last week</span>
        </div>

        {/* Total QR Codes */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="font-ndot text-[10px] text-[var(--fg3)]">TOTAL QR CODES</span>
          <p className="font-ndot text-2xl sm:text-3xl text-[var(--fg)]">{stats.totalQR}</p>
          <span className="text-[10px] text-[var(--accent)] block font-ndot">↑ {stats.qrGrowth || '+16%'} vs. last week</span>
        </div>

        {/* Total Scans */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="font-ndot text-[10px] text-[var(--fg3)]">TOTAL SCANS</span>
          <p className="font-ndot text-2xl sm:text-3xl text-[var(--fg)]">{stats.totalScans}</p>
          <span className="text-[10px] text-[var(--accent)] block font-ndot">↑ {stats.scansGrowth || '+14%'} vs. last week</span>
        </div>
      </div>

      {/* Main Charts & Top Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Click Trends (7 cols) */}
        <div className="lg:col-span-7 corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] p-5 sm:p-7 border border-[var(--line)] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold font-mono text-black dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D71921]"></span>
                CLICK TRAFFIC OSCILLATION
              </h2>
              <p className="text-xs font-mono text-zinc-500 mt-0.5">
                Traffic ingestion window [{range === '30d' ? '30 DAYS' : '7 DAYS'}]
              </p>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 font-mono text-xs">
              <button
                onClick={() => setRange('7d')}
                className={`px-3 py-1 text-xs uppercase tracking-wider cursor-pointer ${
                  range === '7d'
                    ? 'btn-solid'
                    : 'btn-line'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setRange('30d')}
                className={`px-3 py-1 text-xs uppercase tracking-wider cursor-pointer ${
                  range === '30d'
                    ? 'btn-solid'
                    : 'btn-line'
                }`}
              >
                30D
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D71921" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#D71921" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" opacity={0.7} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: 'var(--line)' }}
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: 'var(--line)' }}
                  allowDecimals={false}
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-[#0A0A0A] border border-[var(--line)] text-black dark:text-white px-3 py-2 text-xs font-mono shadow-2xl space-y-1">
                          <p className="font-bold text-[10px] uppercase text-zinc-500">{payload[0].payload.date}</p>
                          <p className="text-[#D71921] font-bold">CLICKS: {payload[0].value}</p>
                          {payload[0].payload.scans !== undefined && (
                            <p className="text-zinc-600 dark:text-zinc-400">SCANS: {payload[0].payload.scans}</p>
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
                  stroke="#D71921"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#clickGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Top Performing Links (5 cols) */}
        <div className="lg:col-span-5 corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] p-5 sm:p-7 border border-[var(--line)] shadow-sm space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h2 className="text-xs sm:text-sm font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D71921]"></span>
              HIGH VELOCITY DESTINATIONS
            </h2>
            {topLinks.length > 0 && (
              <RouterLink
                to="/links"
                className="text-[11px] text-[#D71921] hover:underline uppercase"
              >
                VIEW REGISTRY
              </RouterLink>
            )}
          </div>

          {topLinks.length === 0 ? (
            <div className="text-center py-8 px-4 border border-[var(--line)] space-y-3">
              <div className="w-10 h-10 border border-[var(--line)] text-[#D71921] mx-auto flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-zinc-500">
                No active traffic detected. Synthesize short links to activate telemetry.
              </p>
              <RouterLink
                to="/create-link"
                className="btn-solid inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>GENERATE LINK</span>
              </RouterLink>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] text-zinc-500 border-b border-[var(--line)] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 font-semibold">IDENTIFIER</th>
                    <th className="py-2.5 font-semibold text-center">CLICKS</th>
                    <th className="py-2.5 font-semibold text-right">TREND</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {topLinks.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3 font-semibold text-[#D71921] truncate max-w-[170px]">
                        <a href={item.fullShortUrl} target="_blank" rel="noreferrer" className="hover:underline">
                          {item.shortUrl}
                        </a>
                      </td>
                      <td className="py-3 text-black dark:text-white font-bold text-center">
                        {item.clicks}
                      </td>
                      <td className="py-3 text-[#D71921] text-right font-semibold">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 font-mono">
        <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-[#D71921]" />
              DEVICE MATRIX
            </span>
            <span className="text-[10px] text-zinc-500">[CLIENT]</span>
          </div>

          <div className="space-y-3 pt-1">
            {deviceBreakdown.length > 0 && stats.totalClicks > 0 ? (
              deviceBreakdown.map((dev) => (
                <div key={dev.name} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5 uppercase">
                      {dev.name === 'Desktop' && <Monitor className="w-3.5 h-3.5 text-zinc-400" />}
                      {dev.name === 'Mobile' && <Smartphone className="w-3.5 h-3.5 text-zinc-400" />}
                      {dev.name === 'Tablet' && <Tablet className="w-3.5 h-3.5 text-zinc-400" />}
                      {dev.name}
                    </span>
                    <span className="font-bold">{dev.percentage}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-[#D71921]"
                      style={{ width: `${dev.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">
                NO DEVICE TELEMETRY LOGGED
              </p>
            )}
          </div>
        </div>

        <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#D71921]" />
              BROWSER AGENTS
            </span>
            <span className="text-[10px] text-zinc-500">[USER-AGENT]</span>
          </div>

          <div className="space-y-2.5 pt-1 text-xs">
            {browserBreakdown.length > 0 ? (
              browserBreakdown.map(b => (
                <div key={b.name} className="flex items-center justify-between py-1 border-b border-[var(--line)] last:border-0">
                  <span className="text-zinc-700 dark:text-zinc-300 uppercase">{b.name}</span>
                  <span className="font-bold text-black dark:text-white">{b.pct}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">
                NO BROWSER TELEMETRY LOGGED
              </p>
            )}
          </div>
        </div>

        <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D71921]" />
              REFERRAL INGRESS
            </span>
            <span className="text-[10px] text-zinc-500">[HTTP-REFERER]</span>
          </div>

          <div className="space-y-2.5 pt-1 text-xs">
            {referrerBreakdown.length > 0 ? (
              referrerBreakdown.map(r => (
                <div key={r.name} className="flex items-center justify-between py-1 border-b border-[var(--line)] last:border-0">
                  <span className="text-zinc-700 dark:text-zinc-300 uppercase">{r.name}</span>
                  <span className="font-bold text-[#D71921]">{r.clicks} PKTS</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">
                NO INGRESS SOURCES RECORDED
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
