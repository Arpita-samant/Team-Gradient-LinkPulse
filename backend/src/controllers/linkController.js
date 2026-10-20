import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { generateShortCode } from '../utils/base62.js';
import { checkUrlSafety, calculateMD5 } from '../utils/safetyCheck.js';
import { LinkService, ClickLogService, BlockedDomainService, SystemLogService } from '../models/dataService.js';
import { getBaseUrl } from '../utils/urlHelper.js';

// Reserved keywords that cannot be used as short aliases
const RESERVED_ALIASES = [
  'api', 'admin', 'login', 'signup', 'dashboard', 'settings', 'p', 'r', 'qr',
  'analytics', 'privacy', 'terms', 'contact', 'create-link', 'static', 'assets'
];

export async function createLink(req, res) {
  try {
    const { originalUrl, customAlias, expiryDate, password, tags, title, type = 'link' } = req.body;
    const userId = req.user ? String(req.user._id) : 'usr_anonymous';

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a valid original URL.' });
    }

    // Security check: validate protocol and check blocked domains
    const blockedDomains = await BlockedDomainService.getAll();
    const safety = checkUrlSafety(originalUrl, blockedDomains.map(b => b.domain));
    if (!safety.safe) {
      return res.status(400).json({
        success: false,
        message: safety.reason || 'This destination URL is blocked for security violations.'
      });
    }

    // Alias / Short code assignment
    let shortCode = '';
    if (customAlias && customAlias.trim()) {
      const cleanAlias = customAlias.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(cleanAlias)) {
        return res.status(400).json({
          success: false,
          message: 'Custom alias must be 3-30 characters and contain only letters, numbers, hyphens, or underscores.'
        });
      }

      if (RESERVED_ALIASES.includes(cleanAlias)) {
        return res.status(400).json({
          success: false,
          message: `The alias "${cleanAlias}" is a reserved system keyword.`
        });
      }

      const existing = await LinkService.findByShortCode(cleanAlias);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `The alias "${cleanAlias}" is already taken. Please choose another.`
        });
      }
      shortCode = cleanAlias;
    } else {
      // Generate unique base62 nanoid
      let unique = false;
      let attempts = 0;
      while (!unique && attempts < 10) {
        shortCode = generateShortCode(6);
        const exists = await LinkService.findByShortCode(shortCode);
        if (!exists && !RESERVED_ALIASES.includes(shortCode.toLowerCase())) {
          unique = true;
        }
        attempts++;
      }
    }

    // Expiry date validation: default to 1 year from now if not explicitly set
    let parsedExpiry = null;
    if (expiryDate) {
      parsedExpiry = new Date(expiryDate);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid expiry date format.' });
      }
      if (parsedExpiry <= new Date()) {
        return res.status(400).json({ success: false, message: 'Expiry date must be in the future.' });
      }
    } else {
      // Default expiry date is 1 year from now if not explicitly set
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      parsedExpiry = oneYearFromNow;
    }

    // Password protection hashing
    let hashedPassword = null;
    let hasPassword = false;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
      hasPassword = true;
    }

    // Tags processing
    let cleanTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        cleanTags = tags.map(t => String(t).trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        cleanTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    // Compute MD5 hash of target URL
    const urlHash = calculateMD5(originalUrl);

    // Host base for short URL
    const baseUrl = getBaseUrl(req);
    const shortUrl = `${baseUrl}/${shortCode}`;

    // Generate QR Code data URL
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (qrErr) {
      console.warn('QR Code generation warning:', qrErr.message);
    }

    // Fallback title from domain or path
    let linkTitle = title && title.trim() ? title.trim() : '';
    if (!linkTitle) {
      try {
        const u = new URL(originalUrl);
        linkTitle = u.hostname + (u.pathname.length > 1 ? u.pathname.slice(0, 20) : '');
      } catch {
        linkTitle = shortCode;
      }
    }

    const newLink = await LinkService.create({
      userId,
      originalUrl,
      shortCode,
      customAlias: customAlias ? customAlias.trim() : null,
      title: linkTitle,
      type: type === 'qr' ? 'qr' : 'link',
      tags: cleanTags,
      password: hashedPassword,
      hasPassword,
      expiryDate: parsedExpiry ? parsedExpiry.toISOString() : null,
      status: 'Active',
      isSuspicious: safety.suspicious || false,
      qrCodeDataUrl,
      urlHash
    });

    await SystemLogService.log('LINK_CREATED', `Short link created: /${shortCode} -> ${originalUrl}`, {
      userId,
      userEmail: req.user ? req.user.email : null,
      ip: req.ip
    });

    const { password: _, ...safeLink } = newLink;
    return res.status(201).json({
      success: true,
      message: 'Short link created successfully!',
      link: {
        ...safeLink,
        shortUrl
      }
    });
  } catch (err) {
    console.error('Create link error:', err);
    return res.status(500).json({ success: false, message: 'Server error while generating short link.' });
  }
}

export async function getUserLinks(req, res) {
  try {
    const userId = String(req.user._id);
    const { search, tag, status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc', showAll } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    // Strictly isolate links to the authenticated user's own userId (including admin)
    // Global platform links are managed separately in the Admin Panel
    let links = await LinkService.find({ userId });

    const normalizeTags = (tags) => {
      if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
      if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
      return [];
    };

    // Update statuses for expired links dynamically and backfill 1-year expiry if not set
    const now = new Date();
    links.forEach(l => {
      if (!l.expiryDate && l.createdAt) {
        const d = new Date(l.createdAt);
        d.setFullYear(d.getFullYear() + 1);
        l.expiryDate = d.toISOString();
        LinkService.updateById(l._id, { expiryDate: l.expiryDate });
      }
      if (l.expiryDate && new Date(l.expiryDate) < now && l.status !== 'Expired') {
        l.status = 'Expired';
        LinkService.updateById(l._id, { status: 'Expired' });
      }
    });

    // Filter by status
    if (status && status !== 'All' && status !== 'All Links' && status !== 'undefined') {
      links = links.filter(l => (l.status || 'Active').toLowerCase() === status.toLowerCase());
    }

    // Filter by tag
    if (tag && tag !== 'All Tags' && tag !== 'All' && tag !== 'undefined') {
      const targetTag = tag.trim().toLowerCase();
      links = links.filter(l => normalizeTags(l.tags).some(t => t.toLowerCase() === targetTag));
    }

    // Filter by search
    if (search && search.trim() && search !== 'undefined') {
      const q = search.trim().toLowerCase();
      const tagQ = q.startsWith('#') ? q.slice(1).trim() : q;
      links = links.filter(l =>
        (l.shortCode && l.shortCode.toLowerCase().includes(q)) ||
        (l.originalUrl && l.originalUrl.toLowerCase().includes(q)) ||
        (l.title && l.title.toLowerCase().includes(q)) ||
        normalizeTags(l.tags).some(t => t.toLowerCase().includes(q) || t.toLowerCase().includes(tagQ))
      );
    }

    // Sorting
    links.sort((a, b) => {
      if (sortBy === 'clicks') {
        return order === 'asc' ? (a.clicks || 0) - (b.clicks || 0) : (b.clicks || 0) - (a.clicks || 0);
      }
      return order === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = links.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = links.slice(startIndex, startIndex + limitNum);

    const baseUrl = getBaseUrl(req);
    const formatted = await Promise.all(paginated.map(async ({ password, ...l }) => {
      const shortUrl = `${baseUrl}/${l.shortCode}`;
      let qrCodeDataUrl = l.qrCodeDataUrl;
      if (!qrCodeDataUrl) {
        try {
          qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
          });
          LinkService.updateById(l._id, { qrCodeDataUrl });
        } catch (e) {
          console.warn('QR code fallback generation warning:', e.message);
        }
      }
      return {
        ...l,
        type: l.type || 'link',
        tags: normalizeTags(l.tags),
        shortUrl,
        qrCodeDataUrl: qrCodeDataUrl || ''
      };
    }));

    // Extract all unique tags across this user's links for the filter dropdown
    const allLinksForTags = await LinkService.find({ userId });
    const tagSet = new Set();
    allLinksForTags.forEach(l => {
      normalizeTags(l.tags).forEach(t => tagSet.add(t));
    });

    return res.json({
      success: true,
      links: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      },
      availableTags: Array.from(tagSet)
    });
  } catch (err) {
    console.error('getUserLinks error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve links.' });
  }
}

export async function getLinkById(req, res) {
  try {
    const { id } = req.params;
    const link = await LinkService.findById(id);

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    // Only owner or admin can view details
    if (link.userId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to link.' });
    }

    const baseUrl = getBaseUrl(req);
    const { password, ...safeLink } = link;

    // Fetch click logs and calculate analytics for this specific link
    const clickLogs = await ClickLogService.find({ linkId: id });
    const deviceCounts = { Desktop: 0, Mobile: 0, Tablet: 0 };
    const browserCounts = {};
    const referrerCounts = {};

    clickLogs.forEach(log => {
      const dev = log.device || 'Desktop';
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;

      const br = log.browser || 'Other';
      browserCounts[br] = (browserCounts[br] || 0) + 1;

      const ref = log.referrer || 'Direct';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });

    const recentClicks = clickLogs.slice(-10).reverse().map(l => ({
      _id: l._id,
      timestamp: l.timestamp,
      device: l.device,
      browser: l.browser,
      os: l.os,
      referrer: l.referrer,
      type: l.type
    }));

    return res.json({
      success: true,
      link: {
        ...safeLink,
        shortUrl: `${baseUrl}/${link.shortCode}`,
        analytics: {
          totalClicks: link.clicks || 0,
          qrScans: link.qrScans || 0,
          deviceBreakdown: [
            { name: 'Desktop', value: deviceCounts.Desktop },
            { name: 'Mobile', value: deviceCounts.Mobile },
            { name: 'Tablet', value: deviceCounts.Tablet }
          ],
          browsers: Object.entries(browserCounts).map(([name, count]) => ({ name, count })),
          referrers: Object.entries(referrerCounts).map(([name, count]) => ({ name, count })),
          recentClicks
        }
      }
    });
  } catch (err) {
    console.error('getLinkById error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving link details.' });
  }
}

export async function updateLink(req, res) {
  try {
    const { id } = req.params;
    const { title, tags, status, expiryDate, password, removePassword, customAlias } = req.body;

    const link = await LinkService.findById(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (link.userId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this link.' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (status && ['Active', 'Paused'].includes(status)) updates.status = status;

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        updates.tags = tags.map(t => String(t).trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        updates.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    if (expiryDate !== undefined) {
      if (expiryDate === null || expiryDate === '') {
        updates.expiryDate = null;
      } else {
        const parsed = new Date(expiryDate);
        if (isNaN(parsed.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid expiry date format.' });
        }
        updates.expiryDate = parsed.toISOString();
      }
    }

    if (removePassword) {
      updates.password = null;
      updates.hasPassword = false;
    } else if (password && password.trim()) {
      updates.password = await bcrypt.hash(password.trim(), 10);
      updates.hasPassword = true;
    }

    // Support updating custom alias / short code
    if (customAlias && customAlias.trim()) {
      const cleanAlias = customAlias.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(cleanAlias)) {
        return res.status(400).json({
          success: false,
          message: 'Custom alias must be 3-30 characters and contain only letters, numbers, hyphens, or underscores.'
        });
      }

      if (RESERVED_ALIASES.includes(cleanAlias)) {
        return res.status(400).json({
          success: false,
          message: `The alias "${cleanAlias}" is a reserved system keyword.`
        });
      }

      const existing = await LinkService.findByShortCode(cleanAlias);
      if (existing && existing._id !== id) {
        return res.status(409).json({
          success: false,
          message: `The alias "${cleanAlias}" is already taken. Please choose another.`
        });
      }

      updates.shortCode = cleanAlias;
      updates.customAlias = cleanAlias;

      const baseUrl = getBaseUrl(req);
      const newShortUrl = `${baseUrl}/${cleanAlias}`;
      try {
        updates.qrCodeDataUrl = await QRCode.toDataURL(newShortUrl, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        });
      } catch (qrErr) {
        console.warn('QR code update error:', qrErr.message);
      }
    }

    const updated = await LinkService.updateById(id, updates);
    const { password: _, ...safeLink } = updated;
    const baseUrl = getBaseUrl(req);

    return res.json({
      success: true,
      message: 'Link updated successfully!',
      link: {
        ...safeLink,
        shortUrl: `${baseUrl}/${updated.shortCode}`
      }
    });
  } catch (err) {
    console.error('Update link error:', err);
    return res.status(500).json({ success: false, message: 'Error updating link.' });
  }
}

export async function toggleLinkStatus(req, res) {
  try {
    const { id } = req.params;
    const link = await LinkService.findById(id);

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (link.userId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const newStatus = link.status === 'Active' ? 'Paused' : 'Active';
    const updated = await LinkService.updateById(id, { status: newStatus });

    return res.json({
      success: true,
      message: `Link marked as ${newStatus}!`,
      status: newStatus,
      link: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update link status.' });
  }
}

export async function deleteLink(req, res) {
  try {
    const { id } = req.params;
    const link = await LinkService.findById(id);

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (link.userId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await LinkService.deleteById(id);
    await SystemLogService.log('LINK_DELETED', `Link ${link.shortCode} deleted`, {
      userId: req.user._id,
      userEmail: req.user.email,
      ip: req.ip
    });

    return res.json({
      success: true,
      message: 'Link deleted successfully!'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error deleting link.' });
  }
}

export async function exportLinks(req, res) {
  try {
    const userId = String(req.user._id);
    const { format = 'csv' } = req.query;
    const links = await LinkService.find({ userId });
    const baseUrl = getBaseUrl(req);

    if (format === 'json') {
      const clean = links.map(({ password, ...l }) => ({
        ...l,
        shortUrl: `${baseUrl}/${l.shortCode}`
      }));
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=linkpulse_links.json');
      return res.send(JSON.stringify(clean, null, 2));
    }

    // CSV format
    const headers = ['Short URL', 'Original URL', 'Short Code', 'Title', 'Tags', 'Clicks', 'QR Scans', 'Status', 'Created Date'];
    const rows = links.map(l => [
      `"${baseUrl}/${l.shortCode}"`,
      `"${l.originalUrl.replace(/"/g, '""')}"`,
      `"${l.shortCode}"`,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${(l.tags || []).join(';')}"`,
      l.clicks,
      l.qrScans,
      l.status,
      `"${new Date(l.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=linkpulse_links.csv');
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Export failed.' });
  }
}
