import React, { useState, useEffect } from 'react';
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
  Share2,
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

  // QR & Link Details Modal State
  const [selectedDetailsLink, setSelectedDetailsLink] = useState(null);

  // Edit Modal State
  const [editingLink, setEditingLink] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    tags: '',
    status: 'Active',
    expiryDate: '',
    password: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

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
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter !== 'All Links' ? statusFilter : undefined,
        tag: tagFilter !== 'All Tags' ? tagFilter : undefined
      };
      const res = await linkAPI.getMyLinks(params);
      if (res.success) {
        setLinks(res.links);
        setTotalPages(res.pagination.totalPages);
        setTotalLinks(res.pagination.total);
        if (res.availableTags) {
          setAvailableTags(res.availableTags);
        }
      }
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (shortUrl, id) => {
    navigator.clipboard.writeText(shortUrl);
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
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (id, shortCode) => {
    if (!window.confirm(`Are you sure you want to delete short link "${shortCode}"?`)) return;
    try {
      await linkAPI.delete(id);
      setLinks(prev => prev.filter(l => l._id !== id));
      setTotalLinks(prev => Math.max(0, prev - 1));
      if (selectedDetailsLink?._id === id) {
        setSelectedDetailsLink(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete link.');
    }
  };

  const openEditModal = (link) => {
    setEditingLink(link);
    setEditFormData({
      title: link.title || '',
      tags: Array.isArray(link.tags) ? link.tags.join(', ') : '',
      status: link.status || 'Active',
      expiryDate: link.expiryDate ? link.expiryDate.split('T')[0] : '',
      password: ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingLink) return;
    try {
      setSavingEdit(true);
      const res = await linkAPI.update(editingLink._id, {
        title: editFormData.title,
        tags: editFormData.tags,
        status: editFormData.status,
        expiryDate: editFormData.expiryDate || null,
        password: editFormData.password || undefined
      });
      if (res.success) {
        setLinks(prev => prev.map(l => l._id === editingLink._id ? { ...l, ...res.link } : l));
        setEditingLink(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to update link');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleExport = (format = 'csv') => {
    const token = localStorage.getItem('linkpulse_token');
    window.open(`/api/links/export?format=${format}&token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching Page 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FolderKanban className="w-6 h-6" />
            </div>
            Link Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm pl-12">
            View, edit, and manage all your shortened links and QR codes in one place.
          </p>
        </div>

        <RouterLink
          to="/create-link"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-[#5850ec] hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/25 text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Link</span>
        </RouterLink>
      </div>

      {/* Filter Toolbar matching Page 4 */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search links, tags, or URLs..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/30"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/30 cursor-pointer"
          >
            <option value="All Links">All Links</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Expired">Expired</option>
            <option value="Blocked">Blocked</option>
          </select>

          {/* Tag Filter */}
          <select
            value={tagFilter}
            onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/30 cursor-pointer"
          >
            <option value="All Tags">All Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Export Action */}
          <div className="relative inline-flex items-center">
            <button
              onClick={() => handleExport('csv')}
              className="px-3.5 py-2 text-sm font-medium bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Links Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-900/40 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/80">
              <tr>
                <th className="px-3 py-3.5 w-8">
                  <input type="checkbox" className="rounded text-[#5850ec] focus:ring-indigo-500" />
                </th>
                <th className="px-3 py-3.5 font-semibold text-center w-16">QR Code</th>
                <th className="px-4 py-3.5 font-semibold">Short URL</th>
                <th className="px-4 py-3.5 font-semibold">Original URL</th>
                <th className="px-4 py-3.5 font-semibold">Tags</th>
                <th className="px-4 py-3.5 font-semibold text-center">Clicks</th>
                <th className="px-4 py-3.5 font-semibold">Created Date</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                    Loading links and QR codes...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                    No links found matching your criteria.
                  </td>
                </tr>
              ) : (
                links.map((link) => {
                  const isCopied = copiedId === link._id;
                  const formattedDate = new Date(link.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr
                      key={link._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-3 py-3.5">
                        <input type="checkbox" className="rounded text-[#5850ec] focus:ring-indigo-500" />
                      </td>

                      {/* QR Code thumbnail & click preview */}
                      <td className="px-3 py-3.5 text-center">
                        <button
                          onClick={() => setSelectedDetailsLink(link)}
                          title="View QR Code & Link Details"
                          className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:scale-105 transition-all inline-flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          {link.qrCodeDataUrl ? (
                            <img
                              src={link.qrCodeDataUrl}
                              alt={`QR for ${link.shortCode}`}
                              className="w-8 h-8 rounded object-contain"
                            />
                          ) : (
                            <QrCode className="w-6 h-6 text-indigo-500" />
                          )}
                        </button>
                      </td>

                      {/* Short URL with copy & visit */}
                      <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                            {link.shortCode}
                          </span>
                          <button
                            onClick={() => handleCopy(link.shortUrl, link._id)}
                            aria-label="Copy short link"
                            title="Copy link"
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
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
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Original URL */}
                      <td className="px-4 py-3.5 max-w-xs truncate text-slate-500 dark:text-slate-400 font-mono text-xs">
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          {link.originalUrl}
                        </a>
                      </td>

                      {/* Tags */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {link.tags && link.tags.length > 0 ? (
                            link.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-medium"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Clicks */}
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-200">
                        {link.clicks || 0}
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        {formattedDate}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            link.status === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : link.status === 'Paused'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                              : link.status === 'Expired'
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                          }`}
                        >
                          {link.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setSelectedDetailsLink(link)}
                          title="View QR Code & Details"
                          className="p-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(link)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(link._id)}
                          title={link.status === 'Active' ? 'Pause link' : 'Activate link'}
                          className="p-1 text-slate-400 hover:text-amber-500 rounded transition-colors cursor-pointer"
                        >
                          {link.status === 'Active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4 text-emerald-500" />}
                        </button>
                        <button
                          onClick={() => handleDelete(link._id, link.shortCode)}
                          title="Delete link"
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Page 4 bottom */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {links.length > 0 ? (page - 1) * 10 + 1 : 0}-
            {Math.min(page * 10, totalLinks)} of {totalLinks} links
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-2 font-medium">Pagination</span>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                  page === p
                    ? 'bg-[#5850ec] text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              aria-label="Next page"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Code & Link Details Modal */}
      {selectedDetailsLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Link & QR Code Details
                  </h3>
                  <p className="text-xs text-slate-400">/{selectedDetailsLink.shortCode}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailsLink(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Preview & Download */}
            <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                {selectedDetailsLink.qrCodeDataUrl ? (
                  <img
                    src={selectedDetailsLink.qrCodeDataUrl}
                    alt={`QR Code for ${selectedDetailsLink.shortCode}`}
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                    <QrCode className="w-16 h-16" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                  onClick={() => handleDownloadQR(selectedDetailsLink)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#5850ec] hover:bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => handleCopy(selectedDetailsLink.shortUrl, 'modal')}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedId === 'modal' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Link Details Metadata */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Short Link</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold truncate">
                    {selectedDetailsLink.shortUrl}
                  </span>
                  <a
                    href={selectedDetailsLink.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Destination URL</span>
                <a
                  href={selectedDetailsLink.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-slate-600 dark:text-slate-300 hover:underline block break-all text-xs"
                >
                  {selectedDetailsLink.originalUrl}
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                  <span className="text-slate-400 text-[10px] block">Total Clicks</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedDetailsLink.clicks || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                  <span className="text-slate-400 text-[10px] block">Status</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{selectedDetailsLink.status || 'Active'}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                  <span className="text-slate-400 text-[10px] block">Password</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {selectedDetailsLink.isPasswordProtected ? 'Protected' : 'None'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                  <span className="text-slate-400 text-[10px] block">Created</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(selectedDetailsLink.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDetailsLink(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Edit Link: /{editingLink.shortCode}
              </h3>
              <button
                onClick={() => setEditingLink(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Title / Description
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Link Title"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5850ec]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editFormData.tags}
                  onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                  placeholder="marketing, campaign"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5850ec]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5850ec]"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.expiryDate}
                    onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5850ec]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Update Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="New password (optional)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5850ec]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-[#5850ec] hover:bg-indigo-600 text-white font-semibold shadow-sm"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
