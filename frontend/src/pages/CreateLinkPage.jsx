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
    title: '',
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
        title: formData.title.trim() || undefined,
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
          title: '',
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
      {/* Title Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Create Short Link
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Turn long URLs into short, clean, and shareable links.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Security / Validation Notice</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Long URL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Long URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                name="originalUrl"
                value={formData.originalUrl}
                onChange={handleChange}
                placeholder="https://example.com/your-long-url"
                required
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          {/* Title / Campaign Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Title / Campaign Name <span className="font-normal text-zinc-400 dark:text-zinc-500">(optional)</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. My Portfolio, Instagram Bio, Summer Campaign"
              className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
            />
          </div>

          {/* Row 1: Custom Alias + Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Custom Alias <span className="font-normal text-zinc-400 dark:text-zinc-500">(optional)</span>
              </label>
              <input
                type="text"
                name="customAlias"
                value={formData.customAlias}
                onChange={handleChange}
                placeholder="yourname"
                className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Expiry Date <span className="font-normal text-zinc-400 dark:text-zinc-500">(optional - default 1 year)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Password Protection + Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  Password Protection
                </span>
                <span className="font-normal text-zinc-400 dark:text-zinc-500 ml-1">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Add password"
                  className="w-full pl-4 pr-11 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Tags <span className="font-normal text-zinc-400 dark:text-zinc-500">(optional)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="marketing, blog, etc."
                className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.99] transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Shortening URL...' : 'Generate Short Link'}</span>
          </button>
        </form>
      </div>

      {/* Generated Link Result Card */}
      {createdLink && (
        <div className="bg-white dark:bg-[#121217] rounded-2xl p-6 shadow-sm dark:shadow-xl border border-red-200 dark:border-red-900/50 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Short link generated successfully!</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/80 font-mono">
              Base62 NanoID: {createdLink.shortCode}
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Title / Campaign (if any) */}
            {createdLink.title && (
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Title / Campaign</span>
                <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                  {createdLink.title}
                </p>
              </div>
            )}

            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Shortened URL</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={createdLink.shortUrl}
                  className="flex-1 px-4 py-2.5 text-sm font-medium font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 rounded-xl text-red-600 dark:text-red-400"
                />
                <button
                  onClick={copyShortUrl}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-all cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={createdLink.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  title="Open short link in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Original Destination</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 font-mono truncate mt-0.5">
                {createdLink.originalUrl}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {createdLink.hasPassword && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Password Protected
                </span>
              )}
              {createdLink.expiryDate && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Expires: {new Date(createdLink.expiryDate).toLocaleDateString()}
                </span>
              )}
              {createdLink.tags && createdLink.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
