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
    <div className="space-y-6">
      <div className="panel p-6 sm:p-8 space-y-6">
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-ndot text-2xl text-[var(--fg)]">Admin Panel</h1>
            <p className="text-xs text-[var(--fg2)] mt-1 font-mono">Manage users, links, domains, and platform settings</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddUserModal(true)}
            className="btn btn-solid btn-sm cursor-pointer"
          >
            <span>Add User</span>
          </button>
        </div>

        {/* 3 KPI Metrics matching the attached file */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
            <span className="font-ndot text-[10px] text-[var(--fg3)]">TOTAL USERS</span>
            <p className="font-ndot text-2xl text-[var(--fg)]">{stats.totalUsers || users.length}</p>
            <span className="text-[10px] text-[var(--accent)] block font-ndot">↑ {stats.usersGrowth || '+10%'} last week</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
            <span className="font-ndot text-[10px] text-[var(--fg3)]">TOTAL LINKS</span>
            <p className="font-ndot text-2xl text-[var(--accent)]">{stats.totalLinks || links.length}</p>
            <span className="text-[10px] text-[var(--accent)] block font-ndot">↑ {stats.linksGrowth || '+12%'} last week</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
            <span className="font-ndot text-[10px] text-[var(--fg3)]">SUSPICIOUS LINKS</span>
            <p className="font-ndot text-2xl text-[var(--fg)]">{stats.suspiciousLinks || suspiciousLinksList.length}</p>
            <span className="text-[10px] text-[var(--accent)] block font-ndot">↓ {stats.suspiciousGrowth || '-50%'} last week</span>
          </div>
        </div>
      </div>

      {/* Main Content & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Tabs & Tables (8 cols) */}
        <div className="lg:col-span-8 corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] p-6 sm:p-7 border border-[var(--line)] shadow-sm space-y-6">
          {/* Tabs row */}
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3 overflow-x-auto text-xs font-mono">
            {['Users', 'Links', 'QR Codes', 'Suspicious Links', 'Settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'btn-solid text-xs'
                    : 'btn-line text-xs'
                }`}
              >
                {tab}
                {tab === 'Suspicious Links' && suspiciousLinksList.length > 0 && (
                  <span className="ml-1.5 px-1 py-0.2 text-[9px] bg-white text-black font-bold">
                    {suspiciousLinksList.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab 1: Users Table */}
          {activeTab === 'Users' && (
            <div className="space-y-4 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search accounts..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#D71921]"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 uppercase self-end sm:self-auto">
                  REGISTERED: [{filteredUsers.length}]
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-black text-[10px] text-zinc-500 border-b border-[var(--line)] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">IDENTITY</th>
                      <th className="px-4 py-3">EMAIL</th>
                      <th className="px-4 py-3">ROLE</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3">CREATED</th>
                      <th className="px-4 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {filteredUsers.map((u) => {
                      const initials = u.name
                        ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        : 'U';

                      return (
                        <tr key={u._id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40">
                          {/* Avatar Initials + Name */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 border border-[var(--line)] bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-bold text-[10px] flex items-center justify-center">
                                {initials}
                              </div>
                              <span className="font-bold text-black dark:text-white">
                                {u.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400">
                            {u.email}
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${
                              u.role === 'admin'
                                ? 'border-[#D71921] text-[#D71921] bg-red-500/10'
                                : 'border-zinc-400 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-transparent'
                            }`}>
                              [{u.role === 'admin' ? 'ROOT' : 'USER'}]
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-black dark:text-white text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D71921]"></span>
                              <span>ACTIVE</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteUser(u._id, u.email)}
                              className="p-1 text-zinc-400 hover:text-[#D71921] transition-colors cursor-pointer"
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
            <div className="space-y-4 font-mono">
              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                {activeTab === 'Suspicious Links'
                  ? 'CRITICAL // MALICIOUS DESTINATION SURVEILLANCE'
                  : 'GLOBAL TELEMETRY // ALL ENCODED SHORT LINKS'}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-black text-[10px] text-zinc-500 border-b border-[var(--line)] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">SHORT HASH</th>
                      <th className="px-4 py-3">DESTINATION</th>
                      <th className="px-4 py-3">CLICKS</th>
                      <th className="px-4 py-3">INTEGRITY</th>
                      <th className="px-4 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {(activeTab === 'Suspicious Links' ? suspiciousLinksList : links).map((l) => (
                      <tr key={l._id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40">
                        <td className="px-4 py-3.5 font-bold text-[#D71921]">
                          /{l.shortCode}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                          {l.originalUrl}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-black dark:text-white">
                          {l.clicks || 0}
                        </td>
                        <td className="px-4 py-3.5">
                          {l.isSuspicious ? (
                            <span className="px-2 py-0.5 text-[10px] uppercase font-mono border border-[#D71921] text-[#D71921] bg-red-500/10">
                              [FLAGGED / BLOCKED]
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] uppercase font-mono border border-zinc-400 dark:border-zinc-700 text-black dark:text-white">
                              [CLEAN]
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleToggleSuspicious(l._id)}
                            className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider cursor-pointer ${
                              l.isSuspicious
                                ? 'btn-line'
                                : 'btn-solid'
                            }`}
                          >
                            {l.isSuspicious ? 'UNBLOCK' : 'INTERCEPT'}
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
            <div className="space-y-6 font-mono">
              <div className="border-b border-[var(--line)] pb-3">
                <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-wider">
                  SECURITY BLACKLIST & PHISHING BARRIER
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Origins matching these hostnames are rejected at link ingestion.
                </p>
              </div>

              <div className="space-y-2">
                {blockedDomains.map(d => (
                  <div key={d.domain} className="flex items-center justify-between p-3 border border-[var(--line)] bg-zinc-50 dark:bg-black text-xs">
                    <div>
                      <span className="font-bold text-[#D71921]">{d.domain}</span>
                      <span className="text-zinc-500 ml-2">[{d.reason}]</span>
                    </div>
                    <button
                      onClick={() => handleRemoveBlockedDomain(d.domain)}
                      className="text-xs text-zinc-400 hover:text-[#D71921] uppercase font-semibold cursor-pointer"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions Sidebar (4 cols) */}
        <div className="lg:col-span-4 corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] p-6 sm:p-7 border border-[var(--line)] shadow-sm space-y-5 font-mono">
          <div className="border-b border-[var(--line)] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D71921]"></span>
              COMMAND DISPATCH
            </h2>
          </div>

          <div className="space-y-3">
            {/* Add User */}
            <button
              onClick={() => setShowAddUserModal(true)}
              className="w-full p-3.5 border border-[var(--line)] hover:border-[#D71921] bg-zinc-50 dark:bg-black text-black dark:text-white flex items-center justify-between text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-4 h-4 text-[#D71921]" />
                <span>ENROLL USER</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Block Domain */}
            <button
              onClick={() => setShowBlockDomainModal(true)}
              className="w-full p-3.5 border border-[var(--line)] hover:border-[#D71921] bg-zinc-50 dark:bg-black text-black dark:text-white flex items-center justify-between text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldBan className="w-4 h-4 text-[#D71921]" />
                <span>BLOCK DOMAIN</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* View Suspicious Links */}
            <button
              onClick={() => setActiveTab('Suspicious Links')}
              className="w-full p-3.5 border border-[#D71921] bg-red-500/5 text-[#D71921] flex items-center justify-between text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>THREAT QUEUE</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* System Logs */}
            <button
              onClick={openLogs}
              className="w-full p-3.5 border border-[var(--line)] hover:border-[#D71921] bg-zinc-50 dark:bg-black text-black dark:text-white flex items-center justify-between text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>AUDIT LOGS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] max-w-md w-full p-6 border border-[var(--line)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">ENROLL NEW IDENTITY</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white focus:outline-none focus:border-[#D71921]"
                />
              </div>
              <div>
                <label className="block uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">Email (@gmail.com)</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white focus:outline-none focus:border-[#D71921]"
                />
              </div>
              <div>
                <label className="block uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white focus:outline-none focus:border-[#D71921]"
                />
              </div>
              <div>
                <label className="block uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">Access Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white focus:outline-none focus:border-[#D71921]"
                >
                  <option value="user" className="bg-white dark:bg-black">USER</option>
                  <option value="admin" className="bg-white dark:bg-black">ADMIN (ROOT)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="btn-line px-4 py-2 text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-solid px-5 py-2 text-xs uppercase cursor-pointer"
                >
                  CREATE IDENTITY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Domain Modal */}
      {showBlockDomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] max-w-md w-full p-6 border border-[var(--line)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">ENFORCE DOMAIN BAN</h3>
              <button onClick={() => setShowBlockDomainModal(false)} className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddBlockedDomain} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">Target Hostname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. evil-phishing-site.com"
                  value={newDomainData.domain}
                  onChange={(e) => setNewDomainData({ ...newDomainData, domain: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white focus:outline-none focus:border-[#D71921]"
                />
              </div>
              <div>
                <label className="block uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">Classification Reason</label>
                <input
                  type="text"
                  placeholder="Phishing, Malware, Spam"
                  value={newDomainData.reason}
                  onChange={(e) => setNewDomainData({ ...newDomainData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-black border border-[var(--line)] text-black dark:text-white focus:outline-none focus:border-[#D71921]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowBlockDomainModal(false)}
                  className="btn-line px-4 py-2 text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-solid px-5 py-2 text-xs uppercase cursor-pointer"
                >
                  BLOCK DOMAIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div className="corner-crosshairs-all relative bg-white dark:bg-[#0A0A0A] max-w-2xl w-full p-6 border border-[var(--line)] shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D71921]" />
                AUDIT TELEMETRY LOGS
              </h3>
              <button onClick={() => setShowLogsModal(false)} className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {systemLogs.map(log => (
                <div key={log._id} className="p-3 border border-[var(--line)] bg-zinc-50 dark:bg-black text-xs flex items-start justify-between gap-3 font-mono">
                  <div>
                    <span className="font-bold text-[#D71921]">[{log.action}]</span>{' '}
                    <span className="text-zinc-800 dark:text-zinc-200">{log.details}</span>
                    <div className="text-[10px] text-zinc-500 mt-1">IP: {log.ip} {log.userEmail ? `| USER: ${log.userEmail}` : ''}</div>
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end border-t border-[var(--line)]">
              <button
                onClick={() => setShowLogsModal(false)}
                className="btn-line px-4 py-2 text-xs uppercase cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
