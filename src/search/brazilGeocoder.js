/** Brazilian address search adapter, with geographic country restriction. */
import { normalizeGooglePlace } from './google.js';

const STREET = /^(?:r(?:ua)?\.?|av(?:enida)?\.?|travessa|alameda|estrada|rodovia|praça|praca|largo|viela|passagem|bairro|loteamento|quadra)\s+/i;
const BRAZIL = /(?:\bbrasil\b|\bbrazil\b|,\s*(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b)/i;
export function isBrazilianAddress(query) {
  const text = String(query ?? '').trim();
  return text.length >= 5 && text.length <= 180 && (STREET.test(text) || BRAZIL.test(text));
}
export function createBrazilGeocoder({ fetchImpl = (...args) => fetch(...args), endpoint = '/api/geocode' } = {}) {
  const cache = new Map();
  return {
    async geocode(query, { signal } = {}) {
      signal?.throwIfAborted();
      if (!isBrazilianAddress(query)) return { place: null, answered: true };
      const key = String(query).trim().toLocaleLowerCase('pt-BR');
      const cached = cache.get(key);
      if (cached && cached.expires > Date.now()) return cached.result;
      cache.delete(key);
      const deadline = AbortSignal.timeout(5500);
      const requestSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;
      try {
        const url = new URL(endpoint, globalThis.location?.origin || 'http://localhost');
        url.searchParams.set('q', query);
        url.searchParams.set('country', 'br');
        const response = await fetchImpl(url.pathname + url.search, { signal: requestSignal });
        if (!response.ok) return { place: null, answered: false };
        const data = await response.json();
        const place = data?.status === 'OK' ? normalizeGooglePlace(data.results?.[0]) : null;
        const result = { place, answered: Boolean(place) || data?.status === 'ZERO_RESULTS' };
        if (result.answered) {
          cache.set(key, { result, expires: Date.now() + (place ? 600000 : 45000) });
          while (cache.size > 48) cache.delete(cache.keys().next().value);
        }
        return result;
      } catch {
        signal?.throwIfAborted();
        return { place: null, answered: false };
      }
    },
  };
}
