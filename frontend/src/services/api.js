const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('linkpulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (data) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) })
};

export const linkAPI = {
  create: (linkData) => apiRequest('/links/create', { method: 'POST', body: JSON.stringify(linkData) }),
  getMyLinks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/links/my-links${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/links/${id}`),
  update: (id, updates) => apiRequest(`/links/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  toggleStatus: (id) => apiRequest(`/links/${id}/toggle-status`, { method: 'PATCH' }),
  delete: (id) => apiRequest(`/links/${id}`, { method: 'DELETE' }),
  verifyPassword: (shortCode, password) =>
    apiRequest('/links/verify-password', {
      method: 'POST',
      body: JSON.stringify({ shortCode, password })
    })
};

export const qrAPI = {
  generate: (payload) => apiRequest('/qr/generate', { method: 'POST', body: JSON.stringify(payload) })
};

export const analyticsAPI = {
  getDashboard: (range = '7d') => apiRequest(`/analytics/dashboard?range=${range}`)
};

export const adminAPI = {
  getMetrics: () => apiRequest('/admin/metrics'),
  getUsers: (search = '') => apiRequest(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createUser: (data) => apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUserStatus: (id, data) => apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  getLinks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/links${query ? `?${query}` : ''}`);
  },
  toggleSuspicious: (id) => apiRequest(`/admin/links/${id}/toggle-suspicious`, { method: 'PATCH' }),
  getBlockedDomains: () => apiRequest('/admin/blocked-domains'),
  addBlockedDomain: (data) => apiRequest('/admin/blocked-domains', { method: 'POST', body: JSON.stringify(data) }),
  removeBlockedDomain: (domain) => apiRequest(`/admin/blocked-domains/${encodeURIComponent(domain)}`, { method: 'DELETE' }),
  getLogs: () => apiRequest('/admin/logs')
};
