import bcrypt from 'bcryptjs';
import { LinkService, ClickLogService } from '../models/dataService.js';
import { detectClientInfo } from '../utils/deviceDetector.js';

export async function handleRedirect(req, res) {
  try {
    const { shortCode } = req.params;
    const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;

    const link = await LinkService.findByShortCode(shortCode);

    if (!link) {
      return res.redirect(`${clientUrl}/not-found`);
    }

    // Check if link is blocked
    if (link.status === 'Blocked' || link.isSuspicious) {
      return res.redirect(`${clientUrl}/link-status?code=${shortCode}&type=blocked`);
    }

    // Check if link is paused
    if (link.status === 'Paused') {
      return res.redirect(`${clientUrl}/link-status?code=${shortCode}&type=paused`);
    }

    // Check expiry
    if (link.expiryDate && new Date(link.expiryDate) <= new Date()) {
      if (link.status !== 'Expired') {
        await LinkService.updateById(link._id, { status: 'Expired' });
      }
      return res.redirect(`${clientUrl}/link-status?code=${shortCode}&type=expired`);
    }

    // Check password protection
    if (link.hasPassword && link.password) {
      const providedPwd = req.query.pwd;
      if (!providedPwd) {
        return res.redirect(`${clientUrl}/p/${shortCode}`);
      }
      const match = await bcrypt.compare(providedPwd, link.password);
      if (!match) {
        return res.redirect(`${clientUrl}/p/${shortCode}?error=invalid`);
      }
    }

    // Detect client device, browser, and OS
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientInfo = detectClientInfo(userAgent, ip);
    const isQr = req.query.src === 'qr';

    // Log the click
    await ClickLogService.create({
      linkId: link._id,
      shortCode: link.shortCode,
      userId: link.userId,
      type: isQr ? 'qr_scan' : 'click',
      ip: clientInfo.ip,
      device: clientInfo.deviceType,
      browser: clientInfo.browser,
      os: clientInfo.os,
      referrer: req.headers.referer || req.headers.referrer || 'Direct'
    });

    // Increment click count
    await LinkService.incrementClicks(link._id, isQr);

    // HTTP 302 Redirection
    return res.redirect(302, link.originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).send('Redirection error. Please try again.');
  }
}

export async function verifyLinkPassword(req, res) {
  try {
    const { shortCode, password } = req.body;

    if (!shortCode || !password) {
      return res.status(400).json({ success: false, message: 'Short code and password are required.' });
    }

    const link = await LinkService.findByShortCode(shortCode);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (link.status === 'Blocked' || link.isSuspicious) {
      return res.status(403).json({ success: false, message: 'This link is disabled for safety violations.' });
    }

    if (link.status === 'Paused') {
      return res.status(403).json({ success: false, message: 'This link is currently paused by the creator.' });
    }

    if (link.expiryDate && new Date(link.expiryDate) <= new Date()) {
      return res.status(410).json({ success: false, message: 'This link has expired.' });
    }

    if (!link.hasPassword || !link.password) {
      return res.json({ success: true, originalUrl: link.originalUrl });
    }

    const match = await bcrypt.compare(password, link.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Access denied.' });
    }

    // Log verified click
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientInfo = detectClientInfo(userAgent, ip);

    await ClickLogService.create({
      linkId: link._id,
      shortCode: link.shortCode,
      userId: link.userId,
      type: 'click',
      ip: clientInfo.ip,
      device: clientInfo.deviceType,
      browser: clientInfo.browser,
      os: clientInfo.os,
      referrer: req.headers.referer || req.headers.referrer || 'Password Verification'
    });

    await LinkService.incrementClicks(link._id, false);

    return res.json({
      success: true,
      message: 'Password verified successfully.',
      originalUrl: link.originalUrl
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Password verification failed.' });
  }
}
