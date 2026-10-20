import crypto from 'crypto';

// Default list of high-risk / malicious domains and keywords
const DEFAULT_BLOCKED_DOMAINS = [
  'malware-test.com',
  'phishing-site.ru',
  'steal-creds.xyz',
  'free-crypto-giveaway.top',
  'account-security-alert.tk',
  'paypal-verify-account.info'
];

const SUSPICIOUS_PATTERNS = [
  /free-crypto/i,
  /login-secure-auth/i,
  /bank-verify-pin/i,
  /giftcard-generator/i,
  /download-crack-virus/i
];

/**
 * Computes MD5 hash for a given URL for deduplication and integrity check
 */
export function calculateMD5(str) {
  return crypto.createHash('md5').update(str.trim().toLowerCase()).digest('hex');
}

/**
 * Validates if the string is a valid web URL (http / https only)
 */
export function isValidURL(urlString) {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Detects URLs containing embedded username or password credentials
 */
export function hasEmbeddedCredentials(urlString) {
  try {
    const parsed = new URL(urlString);
    return parsed.username !== '' || parsed.password !== '';
  }
  catch {
    return false;
  }
}

/**
 * Detects URLs that use an IPv4 address instead of a domain name
 */
export function usesIPv4Address(urlString) {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname;

    return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  } catch {
    return false;
  }
}

/**
 * Checks if a target URL is considered malicious, suspicious, or blocked
 */
export function checkUrlSafety(urlString, customBlockedDomains = []) {
  if (!isValidURL(urlString)) {
    return {
      safe: false,
      reason: 'Invalid URL format or unsupported protocol (must be http:// or https://)'
    };
  }

  const parsed = new URL(urlString);
  const hostname = parsed.hostname.toLowerCase();

  //Block URLs containing embedded username or password
  if (hasEmbeddedCredentials(urlString)) {
    return {
      safe: false,
      reason: 'URLs containing embedded credentials are prohibited for security reasons'
    };
  }

  //Flag URLs that use an IP address instead of a domain
  if (usesIPAddress(urlString)) {
    return {
      safe: false,
      suspicious: true,
      reason: 'URLs using IP addresses instead of domain names are flagged for security reasons'
    };
  }

  // Prevent local network/loopback targeting
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.')
  ) {
    return {
      safe: false,
      reason: 'Loopback and private local network URLs are prohibited for safety'
    };
  }

  // Check built-in and dynamic blocked domains
  const allBlocked = [...DEFAULT_BLOCKED_DOMAINS, ...customBlockedDomains.map(d => d.toLowerCase())];
  for (const blocked of allBlocked) {
    if (hostname === blocked || hostname.endsWith(`.${blocked}`)) {
      return {
        safe: false,
        reason: `Target domain "${hostname}" is blocked for security reasons`
      };
    }
  }

  // Check suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(urlString)) {
      return {
        safe: false,
        suspicious: true,
        reason: 'Target URL contains suspicious phishing or malware keywords'
      };
    }
  }

  return { safe: true };
}
