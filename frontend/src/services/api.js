// Auto-normalize API_BASE to ensure /api suffix is present and trailing slashes are removed
let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
if (rawApiUrl) {
  rawApiUrl = rawApiUrl.replace(/\/+$/, '');
  if (!rawApiUrl.endsWith('/api')) {
    rawApiUrl += '/api';
  }
}
const API_BASE = rawApiUrl || '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('linkpulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr) {
    const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    throw new Error(
      isDev
        ? 'Cannot connect to the backend server. Please make sure the backend is running on http://localhost:5000.'
        : 'Cannot connect to the LinkPulse backend service. Please try again in a moment.'
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (data && data.message) {
      throw new Error(data.message);
    }
    if (response.status === 500) {
      const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      throw new Error(
        isDev
          ? 'Backend server is not running or encountered an error. Please make sure the backend is started on http://localhost:5000.'
          : 'Backend service returned a 500 server error. Please check the backend logs on Vercel.'
      );
    }
    throw new Error(`Request failed with status ${response.status}`);
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
    const cleanParams = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '' && v !== 'undefined') {
        cleanParams[k] = v;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
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
    const cleanParams = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '' && v !== 'undefined') {
        cleanParams[k] = v;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return apiRequest(`/admin/links${query ? `?${query}` : ''}`);
  },
  toggleSuspicious: (id) => apiRequest(`/admin/links/${id}/toggle-suspicious`, { method: 'PATCH' }),
  getBlockedDomains: () => apiRequest('/admin/blocked-domains'),
  addBlockedDomain: (data) => apiRequest('/admin/blocked-domains', { method: 'POST', body: JSON.stringify(data) }),
  removeBlockedDomain: (domain) => apiRequest(`/admin/blocked-domains/${encodeURIComponent(domain)}`, { method: 'DELETE' }),
  getLogs: () => apiRequest('/admin/logs')
};
