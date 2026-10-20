import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { linkAPI } from '../services/api';
import {
  FolderKanban,
  Search,
  Plus,
  Download,
  Copy,
  CheckCircle2,
  ExternalLink,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Tag,
  Calendar,
  X,
  QrCode,
  Eye,
  MoreVertical,
  ChevronDown,
  KeyRound,
  Link2,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Share2
} from 'lucide-react';

export default function LinkManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { globalSearch } = useOutletContext() || {};
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Links');
  const [tagFilter, setTagFilter] = useState('All Tags');
  const [availableTags, setAvailableTags] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLinks, setTotalLinks] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  // Active open dropdown for row action menu
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Change Password Modal State
  const [passwordModalLink, setPasswordModalLink] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [removePasswordProtection, setRemovePasswordProtection] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Change Alias Modal State
  const [aliasModalLink, setAliasModalLink] = useState(null);
  const [newAlias, setNewAlias] = useState('');
  const [savingAlias, setSavingAlias] = useState(false);
  const [aliasError, setAliasError] = useState('');

  // QR Code Preview Modal State
  const [qrModalLink, setQrModalLink] = useState(null);

  // Close action menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (globalSearch !== undefined) {
      setSearch(globalSearch);
    }
  }, [globalSearch]);

  useEffect(() => {
    fetchLinks();
  }, [search, statusFilter, tagFilter, page]);

  const fetchLinks = async () => {
    if (!user) {
      setLinks([]);
      setTotalPages(1);
      setTotalLinks(0);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (statusFilter && statusFilter !== 'All Links') {
        params.status = statusFilter;
      }
      if (tagFilter && tagFilter !== 'All Tags') {
        params.tag = tagFilter;
      }
      const res = await linkAPI.getMyLinks(params);
      if (res.success) {
        setLinks(res.links);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalLinks(res.pagination.total || 0);
        if (res.availableTags && res.availableTags.length > 0) {
          setAvailableTags(prev => Array.from(new Set([...prev, ...res.availableTags])));
        }
      }
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQR = (link) => {
    if (!link.qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = link.qrCodeDataUrl;
    a.download = `linkpulse-qr-${link.shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareQR = async (link) => {
    if (!link) return;
    if (navigator.share) {
      try {
        if (link.qrCodeDataUrl && navigator.canShare) {
          try {
            const res = await fetch(link.qrCodeDataUrl);
            const blob = await res.blob();
            const file = new File([blob], `linkpulse-qr-${link.shortCode}.png`, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `QR Code: ${link.title || link.shortCode}`,
                text: `Scan QR code for: ${link.shortUrl}`,
                files: [file]
              });
              return;
            }
          } catch {}
        }
        await navigator.share({
          title: `QR Code: ${link.title || link.shortCode}`,
          text: `Scan QR code for: ${link.shortUrl}`,
          url: link.shortUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    handleCopy(link.shortUrl, 'qr-modal');
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await linkAPI.toggleStatus(id);
      if (res.success) {
        setLinks(prev => prev.map(l => l._id === id ? { ...l, status: res.status } : l));
        setActiveMenuId(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (id, shortCode) => {
    setActiveMenuId(null);
    if (!window.confirm(`Are you sure you want to delete short link "/${shortCode}"? This action cannot be undone.`)) return;
    try {
      await linkAPI.delete(id);
      setLinks(prev => prev.filter(l => l._id !== id));
      setTotalLinks(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Failed to delete link.');
    }
  };

  // Open Change Password Modal
  const openPasswordModal = (link) => {
    setActiveMenuId(null);
    setPasswordModalLink(link);
    setNewPassword('');
    setRemovePasswordProtection(false);
  };

  // Submit Password Change
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordModalLink) return;
    try {
      setSavingPassword(true);
      const res = await linkAPI.update(passwordModalLink._id, {
        password: removePasswordProtection ? undefined : newPassword,
        removePassword: removePasswordProtection
      });
      if (res.success) {
        setLinks(prev => prev.map(l => l._id === passwordModalLink._id ? { ...l, hasPassword: !removePasswordProtection && Boolean(newPassword) } : l));
        setPasswordModalLink(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Open Change Alias Modal
  const openAliasModal = (link) => {
    setActiveMenuId(null);
    setAliasModalLink(link);
    setNewAlias(link.customAlias || link.shortCode || '');
    setAliasError('');
  };

  // Submit Alias Change
  const handleSaveAlias = async (e) => {
    e.preventDefault();
    if (!aliasModalLink) return;
    const clean = newAlias.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(clean)) {
      setAliasError('Alias must be 3-30 characters (letters, numbers, hyphens, or underscores).');
      return;
    }
    try {
      setSavingAlias(true);
      setAliasError('');
      const res = await linkAPI.update(aliasModalLink._id, {
        customAlias: clean
      });
      if (res.success) {
        setLinks(prev => prev.map(l => l._id === aliasModalLink._id ? {
          ...l,
          shortCode: clean,
          customAlias: clean,
          shortUrl: res.link?.shortUrl || l.shortUrl.replace(new RegExp(`/${l.shortCode}$`), `/${clean}`)
        } : l));
        setAliasModalLink(null);
      }
    } catch (err) {
      setAliasError(err.message || 'Failed to change alias.');
    } finally {
      setSavingAlias(false);
    }
  };

  // Helper to determine if link is a QR or Link type
  const isQrType = (link) => {
    return link.type === 'qr' ||
      (link.tags && link.tags.includes('qr-code')) ||
      (link.title && link.title.includes('(QR)'));
  };

  // Helper to format date (missing shows '-' without brackets)
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // Helper to get expiry date (shows explicit date or 1-year default date)
  const getExpiryDate = (link) => {
    if (link.expiryDate) return formatDate(link.expiryDate);
    if (link.createdAt) {
      const d = new Date(link.createdAt);
      d.setFullYear(d.getFullYear() + 1);
      return formatDate(d.toISOString());
    }
    return '-';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="panel p-6 sm:p-8 space-y-6">
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-ndot text-2xl text-[var(--fg)]">Link Management</h1>
            <p className="text-xs text-[var(--fg2)] mt-1 font-mono">View, edit, and manage all your links in one place.</p>
          </div>
          <RouterLink
            to="/create-link"
            className="btn btn-solid btn-sm cursor-pointer"
          >
            <span>Create New Link</span>
          </RouterLink>
        </div>

        {!user && (
          <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[var(--fg2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] led-dot shrink-0" />
              <span>GUEST MODE // Sign up or log in to track, edit, and organize your shortened links.</span>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="btn btn-solid btn-sm whitespace-nowrap cursor-pointer self-start sm:self-auto"
            >
              Sign Up Free
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[var(--fg3)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search links, tags, or URLs..."
              className="input input-with-icon"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--fg3)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs font-mono bg-[var(--surface)] border border-[var(--line)] rounded-xl text-[var(--fg)] focus:outline-none cursor-pointer"
            >
              <option value="All Links" className="bg-white dark:bg-black">All Links</option>
              <option value="Active" className="bg-white dark:bg-black">Active</option>
              <option value="Paused" className="bg-white dark:bg-black">Paused</option>
              <option value="Expired" className="bg-white dark:bg-black">Expired</option>
              <option value="Blocked" className="bg-white dark:bg-black">Blocked</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2">
            <select
              value={tagFilter}
              onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs font-mono bg-[var(--surface)] border border-[var(--line)] rounded-xl text-[var(--fg)] focus:outline-none cursor-pointer"
            >
              <option value="All Tags" className="bg-white dark:bg-black">All Tags</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag} className="bg-white dark:bg-black">#{tag}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchLinks}
            title="Refresh link list"
            className="btn btn-line btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--accent)]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] border border-[var(--line)] shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-zinc-50 dark:bg-black text-[11px] font-semibold text-zinc-500 border-b border-[var(--line)] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">TITLE / TYPE</th>
                <th className="px-4 py-3.5">DESTINATION PAYLOAD</th>
                <th className="px-4 py-3.5">SHORT URL</th>
                <th className="px-4 py-3.5">TAGS</th>
                <th className="px-4 py-3.5 whitespace-nowrap">CREATED</th>
                <th className="px-4 py-3.5 whitespace-nowrap">EXPIRES</th>
                <th className="px-4 py-3.5">STATUS</th>
                <th className="px-4 py-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D71921]" />
                      <span>FETCHING TELEMETRY RECORDS...</span>
                    </div>
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3 font-mono">
                      <div className="w-10 h-10 border border-[var(--line)] text-zinc-400 flex items-center justify-center mx-auto">
                        <FolderKanban className="w-5 h-5 text-[#D71921]" />
                      </div>
                      <p className="text-black dark:text-white font-bold text-sm uppercase tracking-wider">NO RECORDS FOUND</p>
                      <p className="text-zinc-500 text-xs">
                        {search || statusFilter !== 'All Links' || tagFilter !== 'All Tags'
                          ? 'No telemetry matched your parameters. Clear filters to resume broad scan.'
                          : 'Registry is vacant. Encode your first cryptographic short link.'}
                      </p>
                      <RouterLink
                        to="/create-link"
                        className="btn-solid inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>GENERATE LINK</span>
                      </RouterLink>
                    </div>
                  </td>
                </tr>
              ) : (
                links.map((link) => {
                  const isCopied = copiedId === link._id;
                  const isQR = isQrType(link);
                  const isMenuOpen = activeMenuId === link._id;

                  return (
                    <tr
                      key={link._id}
                      className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* 1. Title (QR or Link) */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span
                            title={link.title || '-'}
                            className="font-bold text-black dark:text-white truncate block text-xs"
                          >
                            {link.title && link.title.trim() ? link.title : '-'}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 font-mono uppercase tracking-widest shrink-0 border ${
                              isQR
                                ? 'border-zinc-500 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900'
                                : 'border-[#D71921] text-[#D71921] bg-red-500/10'
                            }`}
                          >
                            {isQR ? 'QR' : 'LINK'}
                          </span>
                        </div>
                      </td>

                      {/* 2. Destination URL */}
                      <td className="px-4 py-3.5 max-w-[220px]">
                        {link.originalUrl ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={link.originalUrl}
                              target="_blank"
                              rel="noreferrer"
                              title={link.originalUrl}
                              className="font-mono text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#D71921] truncate block"
                            >
                              {link.originalUrl}
                            </a>
                            <a
                              href={link.originalUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open original destination"
                              className="text-zinc-400 hover:text-[#D71921] shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs">-</span>
                        )}
                      </td>

                      {/* 3. Short URL */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {link.shortUrl ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#D71921] font-bold text-xs">
                              {link.shortUrl}
                            </span>
                            <button
                              onClick={() => handleCopy(link.shortUrl, link._id)}
                              aria-label="Copy short link"
                              title="Copy short link"
                              className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                            >
                              {isCopied ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#D71921]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={link.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open short link"
                              className="p-1 text-zinc-400 hover:text-[#D71921] transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs">-</span>
                        )}
                      </td>

                      {/* 4. Tags */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {link.tags && link.tags.length > 0 ? (
                            link.tags.map((t, idx) => (
                              <button
                                key={idx}
                                onClick={() => { setTagFilter(t); setPage(1); }}
                                title={`Filter by #${t}`}
                                className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-[var(--line)] hover:border-[#D71921] transition-colors cursor-pointer"
                              >
                                #{t}
                              </button>
                            ))
                          ) : (
                            <span className="text-zinc-400 text-xs">-</span>
                          )}
                        </div>
                      </td>

                      {/* 5. Created At */}
                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-xs">
                        {formatDate(link.createdAt)}
                      </td>

                      {/* 6. Expired At (without brackets) */}
                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-xs">
                        {getExpiryDate(link)}
                      </td>

                      {/* 7. Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${
                            link.status === 'Active'
                              ? 'border-zinc-400 dark:border-zinc-700 text-black dark:text-white bg-zinc-100 dark:bg-zinc-900'
                              : link.status === 'Paused'
                              ? 'border-amber-500/40 text-amber-500 bg-amber-500/10'
                              : link.status === 'Expired'
                              ? 'border-zinc-500 text-zinc-400 bg-transparent'
                              : 'border-[#D71921] text-[#D71921] bg-red-500/10'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${link.status === 'Active' ? 'bg-[#D71921]' : link.status === 'Paused' ? 'bg-amber-500' : 'bg-zinc-500'}`}></span>
                          {link.status || '-'}
                        </span>
                      </td>

                      {/* 8. Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap relative">
                        <div className="inline-block text-left" ref={isMenuOpen ? menuRef : null}>
                          <button
                            onClick={() => setActiveMenuId(isMenuOpen ? null : link._id)}
                            className="btn-line inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono uppercase tracking-wider cursor-pointer"
                          >
                            <span>ACTION</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Floating Action Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-4 top-full mt-1 w-48 bg-white dark:bg-[#0A0A0A] border border-[var(--line)] shadow-xl py-1 z-40 animate-in fade-in zoom-in-95 duration-150 font-mono text-xs">
                              {/* 1. Copy Short URL */}
                              <button
                                onClick={() => {
                                  handleCopy(link.shortUrl, link._id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#D71921] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                <span>COPY SHORT URL</span>
                              </button>

                              {/* 2. Change Password */}
                              <button
                                onClick={() => openPasswordModal(link)}
                                className="w-full px-3 py-2 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#D71921] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                                <span>SET PASSWORD</span>
                              </button>

                              {/* 3. Change Alias */}
                              <button
                                onClick={() => openAliasModal(link)}
                                className="w-full px-3 py-2 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#D71921] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                                <span>CHANGE ALIAS</span>
                              </button>

                              {/* 4. View QR Code */}
                              <button
                                onClick={() => {
                                  setQrModalLink(link);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#D71921] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <QrCode className="w-3.5 h-3.5 text-zinc-400" />
                                <span>VIEW QR CODE</span>
                              </button>

                              {/* 5. Toggle Status */}
                              <button
                                onClick={() => handleToggleStatus(link._id)}
                                className="w-full px-3 py-2 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-amber-500 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                {link.status === 'Active' ? (
                                  <>
                                    <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                                    <span>PAUSE LINK</span>
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-3.5 h-3.5 text-[#D71921]" />
                                    <span>ACTIVATE LINK</span>
                                  </>
                                )}
                              </button>

                              <div className="border-t border-[var(--line)] my-1" />

                              {/* 6. Delete Option */}
                              <button
                                onClick={() => handleDelete(link._id, link.shortCode)}
                                className="w-full px-3 py-2 text-left font-semibold text-[#D71921] hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-[#D71921]" />
                                <span>DELETE LINK</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500 bg-zinc-50 dark:bg-black">
          <div>
            RECORDS [{links.length > 0 ? (page - 1) * 15 + 1 : 0} - {Math.min(page * 15, totalLinks)}] OF [{totalLinks}]
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="btn-line p-1.5 text-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs font-mono font-semibold transition-all cursor-pointer ${
                  page === p
                    ? 'btn-solid'
                    : 'btn-line'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              aria-label="Next page"
              className="btn-line p-1.5 text-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CHANGE PASSWORD MODAL                                     */}
      {/* ======================================================== */}
      {passwordModalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] max-w-md w-full p-6 sm:p-7 border border-[var(--line)] shadow-2xl space-y-5 font-mono">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 border border-[var(--line)] text-[#D71921]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-wider">
                    SECURITY ACCESS LOCK
                  </h3>
                  <p className="text-xs text-[#D71921] font-mono">
                    /{passwordModalLink.shortCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalLink(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs font-mono" autoComplete="off">
              <p className="text-zinc-600 dark:text-zinc-400">
                Impose authentication before target redirection occurs.
              </p>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-black dark:text-white mb-1.5 text-xs">
                  New Passphrase
                </label>
                <input
                  type="password"
                  name="linkNewSecretPassphrase"
                  autoComplete="new-password"
                  data-lpignore="true"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (removePasswordProtection) setRemovePasswordProtection(false);
                  }}
                  placeholder="Passphrase"
                  disabled={removePasswordProtection}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white focus:outline-none focus:border-[#D71921] text-xs disabled:opacity-50"
                />
              </div>

              {passwordModalLink.hasPassword && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={removePasswordProtection}
                    onChange={(e) => {
                      setRemovePasswordProtection(e.target.checked);
                      if (e.target.checked) setNewPassword('');
                    }}
                    className="accent-[#D71921]"
                  />
                  <span className="text-xs font-semibold text-[#D71921]">
                    Purge access protection completely
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setPasswordModalLink(null)}
                  className="btn-line px-4 py-2 text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword || (!newPassword && !removePasswordProtection)}
                  className="btn-solid px-5 py-2 text-xs uppercase cursor-pointer disabled:opacity-50"
                >
                  {savingPassword ? 'UPDATING...' : 'SAVE PASSPHRASE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CHANGE ALIAS MODAL                                        */}
      {/* ======================================================== */}
      {aliasModalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] max-w-md w-full p-6 sm:p-7 border border-[var(--line)] shadow-2xl space-y-5 font-mono">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 border border-[var(--line)] text-[#D71921]">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-wider">
                    MUTATE SLUG ALIAS
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Re-route hash pointer to vanity identifier
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAliasModalLink(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAlias} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Target Slug Identifier
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">/</span>
                  <input
                    type="text"
                    value={newAlias}
                    onChange={(e) => {
                      setNewAlias(e.target.value);
                      setAliasError('');
                    }}
                    placeholder="custom-slug"
                    required
                    className="w-full pl-7 pr-4 py-2.5 bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white font-mono focus:outline-none focus:border-[#D71921] text-xs"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  3-30 chars: a-z, 0-9, hyphens, underscores.
                </span>
              </div>

              {aliasError && (
                <div className="p-3 bg-red-500/10 border border-[#D71921]/40 text-[#D71921] text-xs">
                  {aliasError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setAliasModalLink(null)}
                  className="btn-line px-4 py-2 text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAlias || !newAlias.trim()}
                  className="btn-solid px-5 py-2 text-xs uppercase cursor-pointer disabled:opacity-50"
                >
                  {savingAlias ? 'MUTATING...' : 'SAVE ALIAS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QR CODE PREVIEW MODAL                                     */}
      {/* ======================================================== */}
      {qrModalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] max-w-sm w-full p-6 border border-[var(--line)] shadow-2xl space-y-5 text-center font-mono">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="text-left">
                <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-wider">
                  OPTICAL CODE
                </h3>
                <p className="text-xs text-[#D71921] font-mono">
                  /{qrModalLink.shortCode}
                </p>
              </div>
              <button
                onClick={() => setQrModalLink(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white border border-[var(--line)] mx-auto w-fit">
              {qrModalLink.qrCodeDataUrl ? (
                <img
                  src={qrModalLink.qrCodeDataUrl}
                  alt={`QR for ${qrModalLink.shortCode}`}
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-zinc-400">
                  <QrCode className="w-16 h-16" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleDownloadQR(qrModalLink)}
                className="btn-solid flex-1 py-2 px-3 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD</span>
              </button>

              <button
                onClick={() => handleShareQR(qrModalLink)}
                className="btn-line py-2 px-3 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                title="Share QR Code"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE</span>
              </button>

              <button
                onClick={() => handleCopy(qrModalLink.shortUrl, 'qr-modal')}
                className="btn-line py-2 px-3 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'qr-modal' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D71921]" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
