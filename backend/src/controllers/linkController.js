import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { generateShortCode } from '../utils/base62.js';
import { checkUrlSafety, calculateMD5 } from '../utils/safetyCheck.js';
import { LinkService, BlockedDomainService, SystemLogService } from '../models/dataService.js';

// Reserved keywords that cannot be used as short aliases
const RESERVED_ALIASES = [
  'api', 'admin', 'login', 'signup', 'dashboard', 'settings', 'p', 'r', 'qr',
  'analytics', 'privacy', 'terms', 'contact', 'create-link', 'static', 'assets'
];

export async function createLink(req, res) {
  try {
    const { originalUrl, customAlias, expiryDate, password, tags, title } = req.body;
    const userId = req.user ? req.user._id : 'usr_anonymous';

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

    // Expiry date validation
    let parsedExpiry = null;
    if (expiryDate) {
      parsedExpiry = new Date(expiryDate);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid expiry date format.' });
      }
      if (parsedExpiry <= new Date()) {
        return res.status(400).json({ success: false, message: 'Expiry date must be in the future.' });
      }
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
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
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
    const userId = req.user._id;
    const { search, tag, status, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    let links = await LinkService.find({ userId });

    // Update statuses for expired links dynamically
    const now = new Date();
    links.forEach(l => {
      if (l.expiryDate && new Date(l.expiryDate) < now && l.status !== 'Expired') {
        l.status = 'Expired';
        LinkService.updateById(l._id, { status: 'Expired' });
      }
    });

    // Filter by status
    if (status && status !== 'All' && status !== 'All Links') {
      links = links.filter(l => l.status.toLowerCase() === status.toLowerCase());
    }

    // Filter by tag
    if (tag && tag !== 'All Tags' && tag !== 'All') {
      links = links.filter(l => l.tags && l.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    // Filter by search
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      links = links.filter(l =>
        l.shortCode.toLowerCase().includes(q) ||
        l.originalUrl.toLowerCase().includes(q) ||
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.tags && l.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sorting
    links.sort((a, b) => {
      if (sortBy === 'clicks') {
        return order === 'asc' ? a.clicks - b.clicks : b.clicks - a.clicks;
      }
      return order === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = links.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = links.slice(startIndex, startIndex + limitNum);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const formatted = paginated.map(({ password, ...l }) => ({
      ...l,
      shortUrl: `${baseUrl}/${l.shortCode}`
    }));

    // Extract all unique tags for filter dropdown
    const allUserLinks = await LinkService.find({ userId });
    const tagSet = new Set();
    allUserLinks.forEach(l => {
      if (Array.isArray(l.tags)) {
        l.tags.forEach(t => tagSet.add(t));
      }
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

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const { password, ...safeLink } = link;
    return res.json({
      success: true,
      link: {
        ...safeLink,
        shortUrl: `${baseUrl}/${link.shortCode}`
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving link.' });
  }
}

export async function updateLink(req, res) {
  try {
    const { id } = req.params;
    const { title, tags, status, expiryDate, password, removePassword } = req.body;

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

    const updated = await LinkService.updateById(id, updates);
    const { password: _, ...safeLink } = updated;

    return res.json({
      success: true,
      message: 'Link updated successfully!',
      link: safeLink
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
    const userId = req.user._id;
    const { format = 'csv' } = req.query;
    const links = await LinkService.find({ userId });
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

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
