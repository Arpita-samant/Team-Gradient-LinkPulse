import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
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
  ShieldAlert
} from 'lucide-react';

export default function LinkManagementPage() {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 shadow-sm">
              <FolderKanban className="w-6 h-6" />
            </div>
            Link Management
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm pl-13">
            Search tags, view all links and QR codes, manage aliases, and track statuses.
          </p>
        </div>

        <RouterLink
          to="/create-link"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] transition-all shadow-lg shadow-red-600/30 text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Link</span>
        </RouterLink>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#121217] p-4 rounded-2xl shadow-sm dark:shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
        {/* Search Input (Works for tag, title, URL, alias) */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by tag (#marketing), title, or URL..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 cursor-pointer font-medium"
            >
              <option value="All Links" className="bg-white dark:bg-[#121217]">All Links</option>
              <option value="Active" className="bg-white dark:bg-[#121217]">Active</option>
              <option value="Paused" className="bg-white dark:bg-[#121217]">Paused</option>
              <option value="Expired" className="bg-white dark:bg-[#121217]">Expired</option>
              <option value="Blocked" className="bg-white dark:bg-[#121217]">Blocked</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tags:</span>
            <select
              value={tagFilter}
              onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 cursor-pointer font-medium"
            >
              <option value="All Tags" className="bg-white dark:bg-[#121217]">All Tags ({availableTags.length})</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag} className="bg-white dark:bg-[#121217]">#{tag}</option>
              ))}
            </select>

            {tagFilter !== 'All Tags' && (
              <button
                onClick={() => { setTagFilter('All Tags'); setPage(1); }}
                title="Clear tag filter"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/80 transition-colors cursor-pointer"
              >
                <span>#{tagFilter}</span>
                <X className="w-3.5 h-3.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200" />
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchLinks}
            title="Refresh link list"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-750 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table: Showing Title (QR or Link), Destination URL, Short URL, Tags, Created At, Expired At, Status, Action */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl shadow-sm dark:shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-visible transition-colors">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-900/90 text-xs font-semibold text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 font-semibold">Title (QR or Link)</th>
                <th className="px-4 py-4 font-semibold">Destination URL</th>
                <th className="px-4 py-4 font-semibold">Short URL</th>
                <th className="px-4 py-4 font-semibold">Tags</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Created At</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Expired At</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                      <span>Loading your links and QR data...</span>
                    </div>
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-500 flex items-center justify-center mx-auto">
                        <FolderKanban className="w-6 h-6" />
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 font-semibold text-base">No links found</p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                        {search || statusFilter !== 'All Links' || tagFilter !== 'All Tags'
                          ? 'No links match your current search or filters. Try clearing them.'
                          : 'You haven\'t created any links yet. Start by shortening your first URL.'}
                      </p>
                      <RouterLink
                        to="/create-link"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-md shadow-red-600/30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Short Link</span>
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
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/40 transition-colors group"
                    >
                      {/* 1. Title (QR or Link) */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span
                            title={link.title || '-'}
                            className="font-semibold text-zinc-900 dark:text-white truncate block text-sm"
                          >
                            {link.title && link.title.trim() ? link.title : '-'}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 ${
                              isQR
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                            }`}
                          >
                            {isQR ? 'QR' : 'Link'}
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
                              className="font-mono text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:underline truncate block"
                            >
                              {link.originalUrl}
                            </a>
                            <a
                              href={link.originalUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open original destination"
                              className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 shrink-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600 text-xs">-</span>
                        )}
                      </td>

                      {/* 3. Short URL (of both QR and Link) with Copy Icon */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {link.shortUrl ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-red-600 dark:text-red-400 font-bold text-xs">
                              {link.shortUrl}
                            </span>
                            <button
                              onClick={() => handleCopy(link.shortUrl, link._id)}
                              aria-label="Copy short link"
                              title="Copy short link"
                              className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              {isCopied ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={link.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open short link"
                              className="p-1 rounded text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600 text-xs">-</span>
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
                                title={`Click to filter by tag "#${t}"`}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/60 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-300 border border-zinc-200 dark:border-zinc-750/80 font-medium transition-colors cursor-pointer"
                              >
                                #{t}
                              </button>
                            ))
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-600 text-xs font-mono">-</span>
                          )}
                        </div>
                      </td>

                      {/* 5. Created At */}
                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-xs font-medium font-mono">
                        {formatDate(link.createdAt)}
                      </td>

                      {/* 6. Expired At (shows custom date or 1-year default expiry) */}
                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-xs font-medium font-mono">
                        {getExpiryDate(link)}
                      </td>

                      {/* 7. Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            link.status === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : link.status === 'Paused'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                              : link.status === 'Expired'
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60'
                          }`}
                        >
                          {link.status || '-'}
                        </span>
                      </td>

                      {/* 8. Action: Click shows dropdown with delete, copy, change password, change alias */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap relative">
                        <div className="inline-block text-left" ref={isMenuOpen ? menuRef : null}>
                          <button
                            onClick={() => setActiveMenuId(isMenuOpen ? null : link._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-red-600 dark:hover:bg-red-600 border border-zinc-200 dark:border-zinc-750 rounded-xl transition-all cursor-pointer shadow-xs"
                          >
                            <span>Action</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Floating Action Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-4 top-full mt-1.5 w-52 bg-white dark:bg-[#181820] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-750 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                              {/* 1. Copy Short URL */}
                              <button
                                onClick={() => {
                                  handleCopy(link.shortUrl, link._id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Copy className="w-4 h-4 text-zinc-400" />
                                <span>Copy Short URL</span>
                              </button>

                              {/* 2. Change Password */}
                              <button
                                onClick={() => openPasswordModal(link)}
                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-4 h-4 text-zinc-400" />
                                <span>Change Password</span>
                              </button>

                              {/* 3. Change Alias */}
                              <button
                                onClick={() => openAliasModal(link)}
                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Link2 className="w-4 h-4 text-zinc-400" />
                                <span>Change Alias</span>
                              </button>

                              {/* 4. View QR Code */}
                              <button
                                onClick={() => {
                                  setQrModalLink(link);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <QrCode className="w-4 h-4 text-zinc-400" />
                                <span>View QR Code</span>
                              </button>

                              {/* 5. Toggle Status */}
                              <button
                                onClick={() => handleToggleStatus(link._id)}
                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-500 dark:hover:text-amber-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                {link.status === 'Active' ? (
                                  <>
                                    <PauseCircle className="w-4 h-4 text-amber-500" />
                                    <span>Pause Link</span>
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-4 h-4 text-emerald-500" />
                                    <span>Activate Link</span>
                                  </>
                                )}
                              </button>

                              <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

                              {/* 6. Delete Option */}
                              <button
                                onClick={() => handleDelete(link._id, link.shortCode)}
                                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                                <span>Delete Link</span>
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
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div>
            Showing {links.length > 0 ? (page - 1) * 15 + 1 : 0} - {Math.min(page * 15, totalLinks)} of {totalLinks} total links
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  page === p
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                    : 'border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              aria-label="Next page"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CHANGE PASSWORD MODAL                                     */}
      {/* ======================================================== */}
      {passwordModalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#121217] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                    /{passwordModalLink.shortCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalLink(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 text-sm">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Set a secret password to protect this short link. Visitors must enter this password before being redirected.
              </p>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 text-xs">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (removePasswordProtection) setRemovePasswordProtection(false);
                  }}
                  placeholder="Enter new password"
                  disabled={removePasswordProtection}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-sm disabled:opacity-50"
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
                    className="rounded bg-zinc-800 border-zinc-700 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Remove password protection completely
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPasswordModalLink(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-750 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword || (!newPassword && !removePasswordProtection)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs shadow-md shadow-red-600/30 cursor-pointer disabled:opacity-50"
                >
                  {savingPassword ? 'Updating...' : 'Save Password'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#121217] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                    Change Custom Alias
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Update the short slug for this URL
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAliasModalLink(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlias} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 text-xs">
                  New Custom Alias
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
                    placeholder="my-custom-name"
                    required
                    className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 text-zinc-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-sm"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
                  3-30 characters (letters, numbers, hyphens, underscores).
                </span>
              </div>

              {aliasError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-xs">
                  {aliasError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAliasModalLink(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-750 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAlias || !newAlias.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs shadow-md shadow-red-600/30 cursor-pointer disabled:opacity-50"
                >
                  {savingAlias ? 'Updating...' : 'Save Alias'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#121217] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 transition-colors text-center">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="text-left">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                  QR Code
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                  /{qrModalLink.shortCode}
                </p>
              </div>
              <button
                onClick={() => setQrModalLink(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 mx-auto w-fit">
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadQR(qrModalLink)}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/25 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={() => handleCopy(qrModalLink.shortUrl, 'qr-modal')}
                className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-750 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === 'qr-modal' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
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
