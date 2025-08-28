export function load({ url }) {
    const ALLOWED = new Set([
      'https://spotle.io',
      'https://harmonies.io',
      'https://crosstune.io',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ]);
  
    const r = url.searchParams.get('r') ?? '';
    const n = url.searchParams.get('next') ?? '/';
  
    const safeNext = n.startsWith('/') ? n : '/';
    const allowed = ALLOWED.has(r);
  
    return {
      allowed,
      returnTo: allowed ? r : 'https://spotle.io',
      nextPath: safeNext
    };
  }
  