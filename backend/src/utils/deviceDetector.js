import { UAParser } from 'ua-parser-js';

/**
 * Parses user agent string and returns device, browser, and OS details
 */
export function detectClientInfo(userAgentString, ip = '') {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  // Device type: desktop, mobile, tablet
  let deviceType = result.device.type || 'desktop';
  if (deviceType === 'mobile') deviceType = 'Mobile';
  else if (deviceType === 'tablet') deviceType = 'Tablet';
  else deviceType = 'Desktop';

  const browser = result.browser.name || 'Other';
  const os = result.os.name || 'Other';

  return {
    deviceType,
    browser,
    os,
    ip: ip.replace('::ffff:', '') || '127.0.0.1'
  };
}
