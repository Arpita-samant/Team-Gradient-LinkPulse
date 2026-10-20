import bcrypt from 'bcryptjs';
import {
  UserService,
  LinkService,
  BlockedDomainService,
  SystemLogService,
  ClickLogService
} from '../models/dataService.js';
import { getBaseUrl } from '../utils/urlHelper.js';

export async function getAdminMetrics(req, res) {
  try {
    const totalUsers = await UserService.count();
    const totalLinks = await LinkService.count();
    const suspiciousLinks = await LinkService.count({ isSuspicious: true });
    const allLinks = await LinkService.find();
    const totalQR = allLinks.filter(l => l.qrCodeDataUrl || l.qrScans > 0).length;

    return res.json({
      success: true,
      stats: {
        totalUsers: totalUsers ?? 0,
        usersGrowth: totalUsers > 0 ? '+10%' : '0%',
        totalLinks: totalLinks ?? 0,
        linksGrowth: totalLinks > 0 ? '+12%' : '0%',
        totalQRCodes: totalQR ?? 0,
        qrGrowth: totalQR > 0 ? '+9%' : '0%',
        suspiciousLinks: suspiciousLinks ?? 0,
        suspiciousGrowth: suspiciousLinks > 0 ? '50%' : '0%'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin metrics.' });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { search } = req.query;
    let users = await UserService.find();
    const allLinks = await LinkService.find();

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }

    // Enrich users with their real total links and clicks metrics
    const enrichedUsers = users.map(u => {
      const userLinks = allLinks.filter(l => String(l.userId) === String(u._id));
      const totalClicks = userLinks.reduce((sum, l) => sum + (l.clicks || 0), 0);
      const totalQR = userLinks.filter(l => l.qrCodeDataUrl || l.qrScans > 0).length;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role || 'user',
        status: u.status || 'active',
        totalLinks: userLinks.length,
        totalClicks,
        totalQR,
        createdAt: u.createdAt || new Date().toISOString()
      };
    });

    return res.json({
      success: true,
      users: enrichedUsers
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
}

export async function createUserByAdmin(req, res) {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await UserService.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserService.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      status: 'active'
    });

    await SystemLogService.log('ADMIN_USER_CREATED', `Admin created user account for ${newUser.email}`, {
      userId: req.user._id,
      userEmail: req.user.email,
      ip: req.ip
    });

    const { password: _, ...userSafe } = newUser;
    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: userSafe
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (role) updates.role = role;

    const updated = await UserService.updateById(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await SystemLogService.log('ADMIN_USER_UPDATED', `User ${updated.email} updated (status: ${status}, role: ${role})`, {
      userId: req.user._id,
      userEmail: req.user.email,
      ip: req.ip
    });

    return res.json({
      success: true,
      message: 'User updated successfully.',
      user: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user._id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account.' });
    }

    const user = await UserService.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await UserService.deleteById(id);
    await SystemLogService.log('ADMIN_USER_DELETED', `User ${user.email} deleted by admin`, {
      userId: req.user._id,
      userEmail: req.user.email,
      ip: req.ip
    });

    return res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
}

export async function getAllLinksAdmin(req, res) {
  try {
    const { filter, search } = req.query;
    let links = await LinkService.find();

    if (filter === 'suspicious') {
      links = links.filter(l => l.isSuspicious);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      links = links.filter(l =>
        l.shortCode.toLowerCase().includes(q) ||
        l.originalUrl.toLowerCase().includes(q) ||
        (l.title && l.title.toLowerCase().includes(q))
      );
    }

    const baseUrl = getBaseUrl(req);
    const formatted = links.map(({ password, ...l }) => ({
      ...l,
      shortUrl: `${baseUrl}/${l.shortCode}`
    }));

    return res.json({
      success: true,
      links: formatted
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve links.' });
  }
}

export async function toggleSuspiciousLink(req, res) {
  try {
    const { id } = req.params;
    const link = await LinkService.findById(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    const newSuspicious = !link.isSuspicious;
    const newStatus = newSuspicious ? 'Blocked' : 'Active';

    const updated = await LinkService.updateById(id, {
      isSuspicious: newSuspicious,
      status: newStatus
    });

    await SystemLogService.log('LINK_SECURITY_TOGGLED', `Link ${link.shortCode} marked as ${newSuspicious ? 'Suspicious/Blocked' : 'Clean/Active'}`, {
      userId: req.user._id,
      userEmail: req.user.email,
      ip: req.ip
    });

    return res.json({
      success: true,
      message: `Link marked as ${newSuspicious ? 'Suspicious' : 'Clean'}.`,
      link: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle link security status.' });
  }
}

export async function getBlockedDomains(req, res) {
  try {
    const domains = await BlockedDomainService.getAll();
    return res.json({ success: true, domains });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch blocked domains.' });
  }
}

export async function addBlockedDomain(req, res) {
  try {
    const { domain, reason } = req.body;
    if (!domain || !domain.trim()) {
      return res.status(400).json({ success: false, message: 'Domain name is required.' });
    }

    const blocked = await BlockedDomainService.add(domain.trim(), reason || 'Security blocklist', req.user.name);
    await SystemLogService.log('DOMAIN_BLOCKED', `Domain "${domain.trim()}" blocked by admin`, {
      userId: req.user._id,
      userEmail: req.user.email,
      ip: req.ip
    });

    return res.json({
      success: true,
      message: `Domain "${domain.trim()}" has been blocked.`,
      blocked
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to block domain.' });
  }
}

export async function removeBlockedDomain(req, res) {
  try {
    const { domain } = req.params;
    await BlockedDomainService.remove(domain);
    await SystemLogService.log('DOMAIN_UNBLOCKED', `Domain "${domain}" unblocked by admin`, {
      userId: req.user._id,
      userEmail: req.user.email,
      ip: req.ip
    });

    return res.json({
      success: true,
      message: `Domain "${domain}" has been removed from blocklist.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove blocked domain.' });
  }
}

export async function getSystemLogs(req, res) {
  try {
    const logs = await SystemLogService.getAll(100);
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch system logs.' });
  }
}
