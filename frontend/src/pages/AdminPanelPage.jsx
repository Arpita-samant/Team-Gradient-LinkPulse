import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Link2,
  QrCode,
  AlertTriangle,
  Search,
  UserPlus,
  ShieldBan,
  FileText,
  ChevronRight,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function AdminPanelPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Users');
  const [stats, setStats] = useState({
    totalUsers: 48,
    usersGrowth: '+10%',
    totalLinks: 1248,
    linksGrowth: '+12%',
    totalQRCodes: 356,
    qrGrowth: '+9%',
    suspiciousLinks: 3,
    suspiciousGrowth: '50%'
  });

  const [users, setUsers] = useState([]);
  const [links, setLinks] = useState([]);
  const [blockedDomains, setBlockedDomains] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', role: 'user' });

  const [showBlockDomainModal, setShowBlockDomainModal] = useState(false);
  const [newDomainData, setNewDomainData] = useState({ domain: '', reason: '' });

  const [showLogsModal, setShowLogsModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [metricsRes, usersRes, linksRes, domainsRes] = await Promise.all([
        adminAPI.getMetrics(),
        adminAPI.getUsers(),
        adminAPI.getLinks(),
        adminAPI.getBlockedDomains()
      ]);

      if (metricsRes.success) setStats(metricsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (linksRes.success) setLinks(linksRes.links);
      if (domainsRes.success) setBlockedDomains(domainsRes.domains);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createUser(newUserData);
      if (res.success) {
        setUsers([res.user, ...users]);
        setShowAddUserModal(false);
        setNewUserData({ name: '', email: '', password: '', role: 'user' });
      }
    } catch (err) {
      alert(err.message || 'Failed to create user.');
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const handleToggleSuspicious = async (linkId) => {
    try {
      const res = await adminAPI.toggleSuspicious(linkId);
      if (res.success) {
        setLinks(links.map(l => l._id === linkId ? { ...l, isSuspicious: res.link.isSuspicious, status: res.link.status } : l));
        // refresh stats
        const metricsRes = await adminAPI.getMetrics();
        if (metricsRes.success) setStats(metricsRes.stats);
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle suspicious flag');
    }
  };

  const handleAddBlockedDomain = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.addBlockedDomain(newDomainData);
      if (res.success) {
        setBlockedDomains([...blockedDomains, res.blocked]);
        setShowBlockDomainModal(false);
        setNewDomainData({ domain: '', reason: '' });
      }
    } catch (err) {
      alert(err.message || 'Failed to block domain');
    }
  };

  const handleRemoveBlockedDomain = async (domain) => {
    if (!window.confirm(`Unblock domain "${domain}"?`)) return;
    try {
      await adminAPI.removeBlockedDomain(domain);
      setBlockedDomains(blockedDomains.filter(b => b.domain !== domain));
    } catch (err) {
      alert(err.message || 'Failed to unblock domain');
    }
  };

  const openLogs = async () => {
    try {
      const res = await adminAPI.getLogs();
      if (res.success) setSystemLogs(res.logs);
      setShowLogsModal(true);
    } catch (err) {
      alert('Could not fetch logs');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const suspiciousLinksList = links.filter(l => l.isSuspicious);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          Admin Panel
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm pl-12">
          Manage users, links, domains, and platform settings
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-[#121217] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-3 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {stats.totalUsers}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.usersGrowth}</span>
            <span className="text-zinc-500 font-normal">last week</span>
          </div>
        </div>

        {/* Total Links */}
        <div className="bg-white dark:bg-[#121217] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-3 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Links</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {stats.totalLinks?.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.linksGrowth}</span>
            <span className="text-zinc-500 font-normal">last week</span>
          </div>
        </div>

        {/* Total QR Codes */}
        <div className="bg-white dark:bg-[#121217] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl space-y-3 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total QR Codes</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {stats.totalQRCodes}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.qrGrowth}</span>
            <span className="text-zinc-500 font-normal">last week</span>
          </div>
        </div>

        {/* Suspicious Links */}
        <div className="bg-[#121217] p-6 rounded-2xl border border-red-900/40 shadow-xl space-y-3 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400">Suspicious Links</span>
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/80 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-red-400">
            {stats.suspiciousLinks}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.suspiciousGrowth}</span>
            <span className="text-zinc-500 font-normal">last week</span>
          </div>
        </div>
      </div>

      {/* Main Content & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Tabs & Tables (8 cols) */}
        <div className="lg:col-span-8 bg-[#121217] rounded-2xl p-6 sm:p-7 border border-zinc-800 shadow-xl space-y-6">
          {/* Tabs row */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto text-sm font-semibold">
            {['Users', 'Links', 'QR Codes', 'Suspicious Links', 'Settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
                {tab === 'Suspicious Links' && suspiciousLinksList.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded-full">
                    {suspiciousLinksList.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab 1: Users Table */}
          {activeTab === 'Users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-900 border border-zinc-750 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                </div>
                <span className="text-xs text-zinc-400 font-medium self-end sm:self-auto">
                  Total Users: {filteredUsers.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/80 text-xs font-semibold text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created At</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredUsers.map((u) => {
                      const initials = u.name
                        ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        : 'U';

                      return (
                        <tr key={u._id} className="hover:bg-zinc-850/40 text-xs">
                          {/* Avatar Circle + Name */}
                          <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                                {initials}
                              </div>
                              <span className="font-semibold text-white">
                                {u.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-mono text-zinc-400">
                            {u.email}
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              u.role === 'admin'
                                ? 'bg-red-950/80 text-red-300 border border-red-800/80'
                                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>Active</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => handleDeleteUser(u._id, u.email)}
                              className="p-1 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Links / Suspicious Links */}
          {(activeTab === 'Links' || activeTab === 'Suspicious Links') && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                {activeTab === 'Suspicious Links'
                  ? 'Links identified with unsafe destination patterns or reported domains.'
                  : 'All shortened URLs across all registered users on LinkPulse.'}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/80 text-xs font-semibold text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">Short URL</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Clicks</th>
                      <th className="px-4 py-3">Security Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {(activeTab === 'Suspicious Links' ? suspiciousLinksList : links).map((l) => (
                      <tr key={l._id} className="hover:bg-zinc-850/40 text-xs">
                        <td className="px-4 py-3.5 font-mono font-bold text-red-400">
                          {l.shortCode}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-400 max-w-xs truncate">
                          {l.originalUrl}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-zinc-200">
                          {l.clicks || 0}
                        </td>
                        <td className="px-4 py-3.5">
                          {l.isSuspicious ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-950 text-red-400 border border-red-800">
                              Suspicious / Blocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                              Clean / Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleSuspicious(l._id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              l.isSuspicious
                                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                : 'bg-red-600 text-white hover:bg-red-500'
                            }`}
                          >
                            {l.isSuspicious ? 'Unblock Link' : 'Disable / Flag'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Settings / Blocked Domains */}
          {activeTab === 'Settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-white mb-1">
                  Security Blocklist & Domain Protection
                </h3>
                <p className="text-xs text-zinc-400">
                  Target URLs matching blocked domains cannot be shortened or redirected by users.
                </p>
              </div>

              <div className="space-y-2">
                {blockedDomains.map(d => (
                  <div key={d.domain} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-750 text-xs">
                    <div>
                      <span className="font-mono font-semibold text-red-400">{d.domain}</span>
                      <span className="text-zinc-500 ml-2">({d.reason})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveBlockedDomain(d.domain)}
                      className="text-xs text-zinc-400 hover:text-red-400 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#121217] rounded-2xl p-6 sm:p-7 border border-zinc-800 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white">
            Quick Actions
          </h2>

          <div className="space-y-3">
            {/* Add User */}
            <button
              onClick={() => setShowAddUserModal(true)}
              className="w-full p-4 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-800/60 text-red-300 flex items-center justify-between font-semibold text-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-red-400" />
                <span>Add User</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>

            {/* Block Domain */}
            <button
              onClick={() => setShowBlockDomainModal(true)}
              className="w-full p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 flex items-center justify-between font-semibold text-sm transition-all cursor-pointer border border-zinc-750"
            >
              <div className="flex items-center gap-3">
                <ShieldBan className="w-5 h-5 text-red-400" />
                <span>Block Domain</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            {/* View Suspicious Links */}
            <button
              onClick={() => setActiveTab('Suspicious Links')}
              className="w-full p-4 rounded-xl bg-red-950/50 hover:bg-red-900/50 border border-red-800/70 text-red-300 flex items-center justify-between font-semibold text-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>View Suspicious Links</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>

            {/* System Logs */}
            <button
              onClick={openLogs}
              className="w-full p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 flex items-center justify-between font-semibold text-sm transition-all cursor-pointer border border-zinc-750"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-zinc-400" />
                <span>System Logs</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121217] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Add New User</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email (@gmail.com)</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-200 focus:outline-none"
                >
                  <option value="user" className="bg-[#121217]">User</option>
                  <option value="admin" className="bg-[#121217]">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-750 text-zinc-300 hover:bg-zinc-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-md shadow-red-600/30 cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Domain Modal */}
      {showBlockDomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121217] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Block Malicious Domain</h3>
              <button onClick={() => setShowBlockDomainModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBlockedDomain} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Domain Hostname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. evil-phishing-site.com"
                  value={newDomainData.domain}
                  onChange={(e) => setNewDomainData({ ...newDomainData, domain: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 font-mono text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Reason</label>
                <input
                  type="text"
                  placeholder="Phishing, Malware, Spam"
                  value={newDomainData.reason}
                  onChange={(e) => setNewDomainData({ ...newDomainData, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockDomainModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-750 text-zinc-300 hover:bg-zinc-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-md shadow-red-600/30 cursor-pointer"
                >
                  Block Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121217] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-800 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Security & System Audit Logs
              </h3>
              <button onClick={() => setShowLogsModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {systemLogs.map(log => (
                <div key={log._id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs flex items-start justify-between gap-3 font-mono">
                  <div>
                    <span className="font-bold text-red-400">[{log.action}]</span>{' '}
                    <span className="text-zinc-300 font-sans">{log.details}</span>
                    <div className="text-[10px] text-zinc-500 mt-1 font-mono">IP: {log.ip} {log.userEmail ? `| User: ${log.userEmail}` : ''}</div>
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
