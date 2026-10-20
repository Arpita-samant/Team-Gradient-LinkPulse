/**
 * Resolves the public base URL for short links, QR codes, and redirects.
 * Automatically handles:
 * - Production on Vercel/cloud (safely ignores accidental localhost BASE_URL)
 * - Reverse proxy headers (x-forwarded-proto, x-forwarded-host)
 * - Production https enforcement
 */
export function getBaseUrl(req) {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const configuredBase = (process.env.BASE_URL || '').trim().replace(/\/+$/, '');

  // 1. If an explicit non-localhost BASE_URL is set, use it
  if (configuredBase && (!isProd || !configuredBase.includes('localhost'))) {
    return configuredBase;
  }

  // 2. Derive dynamically from request headers
  if (req) {
    const rawProto = req.headers?.['x-forwarded-proto'] || (req.secure ? 'https' : '') || req.protocol || 'http';
    const host = req.headers?.['x-forwarded-host'] || (typeof req.get === 'function' ? req.get('host') : req.headers?.host);

    if (host && (!isProd || !host.includes('localhost'))) {
      const proto = isProd || rawProto === 'https' ? 'https' : 'http';
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }

  // 3. Production fallback
  if (isProd) {
    return 'https://team-gradient-link-pulse.vercel.app';
  }

  // 4. Local dev fallback
  return `http://localhost:${process.env.PORT || 5000}`;
}
