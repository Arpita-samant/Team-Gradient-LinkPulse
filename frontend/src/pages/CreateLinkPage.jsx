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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="panel p-6 sm:p-8 space-y-6">
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>

        <div>
          <h1 className="font-ndot text-2xl text-[var(--fg)]">Create Short Link</h1>
          <p className="text-xs text-[var(--fg2)] mt-1 font-mono">Turn long URLs into short, clean and shareable links.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)] text-xs font-mono flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold tracking-wider uppercase font-ndot">VALIDATION ERROR // REFUSED</p>
              <p className="mt-1 text-[var(--fg2)]">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Long URL */}
          <div>
            <label htmlFor="long-url" className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">
              Long URL *
            </label>
            <input
              id="long-url"
              type="url"
              name="originalUrl"
              value={formData.originalUrl}
              onChange={handleChange}
              placeholder="https://example.com/your-long-url"
              required
              className="input"
            />
          </div>

          {/* Title / Campaign Name */}
          <div>
            <label htmlFor="title-field" className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">
              Title / Campaign Identifier (optional)
            </label>
            <input
              id="title-field"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Q4 Launch, Technical Specs, Portfolio"
              className="input"
            />
          </div>

          {/* Custom Alias */}
          <div>
            <label htmlFor="custom-alias" className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">
              Custom Alias (optional)
            </label>
            <input
              id="custom-alias"
              type="text"
              name="customAlias"
              value={formData.customAlias}
              onChange={handleChange}
              placeholder="yourname"
              className="input"
            />
          </div>

          {/* Password Protection */}
          <div>
            <label htmlFor="pwd-prot" className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">
              Password Protection (optional)
            </label>
            <div className="relative">
              <input
                id="pwd-prot"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Add password"
                className="input pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--fg3)] hover:text-[var(--fg)] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="exp-date" className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">
              Expiry Date (optional)
            </label>
            <input
              id="exp-date"
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="input"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags-field" className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">
              Tags (optional)
            </label>
            <input
              id="tags-field"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="marketing, blog, etc."
              className="input"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-solid w-full py-4 text-xs cursor-pointer disabled:opacity-50"
            >
              <Link2 className="w-4 h-4 shrink-0" />
              <span>{loading ? 'GENERATING...' : 'Generate Short Link'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Link Result Card */}
      {createdLink && (
        <div className="panel p-6 sm:p-8 space-y-4 animate-in fade-in duration-300">
          <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--accent)]">+</span>
          <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--accent)]">+</span>
          <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--accent)]">+</span>
          <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--accent)]">+</span>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2 text-[var(--accent)] font-ndot text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>LINK GENERATED // STATUS: 201 OK</span>
            </div>
            <span className="font-ndot text-[11px] px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)] text-[var(--fg2)]">
              HASH: {createdLink.shortCode}
            </span>
          </div>

          <div className="space-y-4 pt-1 font-mono">
            {/* Title / Campaign (if any) */}
            {createdLink.title && (
              <div>
                <span className="text-[10px] font-ndot text-[var(--fg3)]">IDENTIFIER</span>
                <p className="text-sm font-bold text-[var(--fg)] mt-0.5">
                  {createdLink.title}
                </p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-ndot text-[var(--fg3)]">ENCODED URL</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={createdLink.shortUrl}
                  className="input text-[var(--accent)] font-ndot"
                />
                <button
                  type="button"
                  onClick={copyShortUrl}
                  className="btn btn-solid btn-sm"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
                <a
                  href={createdLink.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-line btn-sm"
                  title="Open short link in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-ndot text-[var(--fg3)]">DESTINATION TARGET</span>
              <p className="text-xs text-[var(--fg2)] font-mono truncate mt-0.5">
                {createdLink.originalUrl}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--line)] text-[11px]">
              {createdLink.hasPassword && (
                <span className="px-2 py-0.5 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] flex items-center gap-1 font-ndot text-[10px]">
                  <Lock className="w-3 h-3 text-[var(--accent)]" /> PROTECTED
                </span>
              )}
              {createdLink.expiryDate && (
                <span className="px-2 py-0.5 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] flex items-center gap-1 font-ndot text-[10px]">
                  <Calendar className="w-3 h-3 text-[var(--fg3)]" /> EXP: {new Date(createdLink.expiryDate).toLocaleDateString()}
                </span>
              )}
              {createdLink.tags && createdLink.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--fg2)] font-ndot text-[10px]">
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
