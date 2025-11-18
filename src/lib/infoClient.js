import { INFO_URL } from './hlEndpoints.js';

export async function infoQuery(payload) {
  const res = await fetch(INFO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`INFO_${res.status}`);
  return res.json();
}

/** Prix de référence ~il y a 24h (open du 1er chandelier >= now-24h) */
export async function refPrice24h(coin = 'BTC') {
  const end = Date.now();
  const start = end - 24 * 60 * 60 * 1000 - 60 * 1000; // marge 1 min
  const data = await infoQuery({
    type: 'candleSnapshot',
    req: { coin, interval: '1m', startTime: start, endTime: end },
  });
  const first = Array.isArray(data) && data.length ? data[0] : null;
  return first?.o != null ? Number(first.o) : null;
}
