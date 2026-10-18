import React, { useState } from 'react';
import { linkAPI } from '../services/api';
import {
  Link2,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Tag,
  Sparkles,
  Copy,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Download,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export default function CreateLinkPage() {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    expiryDate: '',
    password: '',
    tags: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.originalUrl.trim()) {
      setError('Please enter a long URL to shorten.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await linkAPI.create({
        originalUrl: formData.originalUrl.trim(),
        customAlias: formData.customAlias.trim() || undefined,
        expiryDate: formData.expiryDate || undefined,
        password: formData.password || undefined,
        tags: formData.tags
      });

      if (res.success) {
        setCreatedLink(res.link);
        // Clear input form
        setFormData({
          originalUrl: '',
          customAlias: '',
          expiryDate: '',
          password: '',
          tags: ''
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to create short link.');
    } finally {
      setLoading(false);
    }
  };

  const copyShortUrl = () => {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Header matching Page 2 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create Short Link
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Turn long URLs into short, clean and shareable links.
        </p>
      </div>

      {/* Main Form Card matching Page 2 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-colors">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-semibold">Security / Validation Notice</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Long URL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Long URL
            </label>
            <div className="relative">
              <input
                type="url"
                name="originalUrl"
                value={formData.originalUrl}
                onChange={handleChange}
                placeholder="https://example.com/your-long-url"
                required
                className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/30 focus:border-[#5850ec] transition-all"
              />
            </div>
          </div>

          {/* Row 1: Custom Alias + Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Custom Alias <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                name="customAlias"
                value={formData.customAlias}
                onChange={handleChange}
                placeholder="yourname"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/30 focus:border-[#5850ec] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Expiry Date <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/30 focus:border-[#5850ec] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Password Protection + Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password Protection
                </span>
                <span className="font-normal text-slate-400 ml-1">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Add password"
                  className="w-full pl-4 pr-11 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/30 focus:border-[#5850ec] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Tags <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="marketing, blog, etc."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/30 focus:border-[#5850ec] transition-all"
              />
            </div>
          </div>

          {/* Primary Submit Button matching Page 2 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-[#5850ec] hover:bg-indigo-600 active:scale-[0.99] transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Shortening URL...' : 'Generate Short Link'}</span>
          </button>
        </form>
      </div>

      {/* Generated Link Result Card */}
      {createdLink && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-indigo-100 dark:border-indigo-900/50 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Short link generated successfully!</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-mono">
              Base62 NanoID: {createdLink.shortCode}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
            {/* Left 2 columns: Link details */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <span className="text-xs text-slate-400">Shortened URL</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={createdLink.shortUrl}
                    className="flex-1 px-4 py-2.5 text-sm font-medium font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400"
                  />
                  <button
                    onClick={copyShortUrl}
                    className="px-4 py-2.5 rounded-xl bg-[#5850ec] text-white hover:bg-indigo-600 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <a
                    href={createdLink.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    title="Open short link in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Original Destination</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono truncate mt-0.5">
                  {createdLink.originalUrl}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {createdLink.hasPassword && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Password Protected
                  </span>
                )}
                {createdLink.expiryDate && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Expires: {new Date(createdLink.expiryDate).toLocaleDateString()}
                  </span>
                )}
                {createdLink.tags && createdLink.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right column: Instant QR preview */}
            {createdLink.qrCodeDataUrl && (
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <img
                  src={createdLink.qrCodeDataUrl}
                  alt="QR Code"
                  className="w-32 h-32 rounded-lg bg-white p-1 shadow-xs"
                />
                <a
                  href={createdLink.qrCodeDataUrl}
                  download={`linkpulse-${createdLink.shortCode}.png`}
                  className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download QR Code
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
