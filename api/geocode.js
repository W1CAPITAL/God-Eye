/** Public-address-only geocoding; fixed provider endpoint, no user-supplied URL proxy. */
import { nominatimToGeocodeResult } from '../src/nominatimGeocode.js';
const cache = new Map();
let nextAt = 0;
let queue = Promise.resolve();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const provider = () => {
  const configured = process.env.NOMINATIM_SEARCH_URL;
  if (!configured) return 'https://nominatim.openstreetmap.org/search';
  const url = new URL(configured);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Invalid provider URL');
  return url.toString();
};
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  const q = String(req.query.q ?? '').trim();
  if (q.length < 2 || q.length > 180 || /[\x00-\x1f]/.test(q))
    return res.status(400).json({ error: 'Informe uma rua, bairro, CEP, cidade ou endereço válido.' });
  const brazil = String(req.query.country ?? '').toLowerCase() === 'br';
  const key = (brazil ? 'BR:' : 'GLOBAL:') + q.toLocaleLowerCase('pt-BR');
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) {
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json(hit.value);
  }
  try {
    const pending = queue.then(async () => {
      const delay = Math.max(0, nextAt - Date.now());
      if (delay) await sleep(delay);
      nextAt = Date.now() + 1200;
      const url = new URL(provider());
      url.searchParams.set('q', q);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '3');
      url.searchParams.set('accept-language', 'pt-BR');
      if (brazil) url.searchParams.set('countrycodes', 'br');
      const reply = await fetch(url, { headers: {
        'User-Agent': 'W1CAPITAL-God-Eye/1.0 (+https://github.com/W1CAPITAL/God-Eye)',
        Accept: 'application/json'
      }, redirect: 'error', signal: AbortSignal.timeout(7000) });
      if (!reply.ok) throw new Error('provider unavailable');
      const rows = await reply.json();
      if (!Array.isArray(rows)) throw new Error('invalid geocode response');
      const place = rows.map(nominatimToGeocodeResult).find(Boolean);
      const value = place ? { status: 'OK', results: [place] } : { status: 'ZERO_RESULTS', results: [] };
      cache.set(key, { value, until: Date.now() + (place ? 3600000 : 120000) });
      while (cache.size > 160) cache.delete(cache.keys().next().value);
      return value;
    });
    queue = pending.catch(() => null);
    const value = await pending;
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json(value);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ status: 'UNKNOWN_ERROR', results: [], error: 'Busca indisponível; mecanismo alternativo será utilizado.' });
  }
}
