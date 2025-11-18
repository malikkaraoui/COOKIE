import { useEffect, useRef, useState } from 'react';
import { WS_URL } from '../lib/hlEndpoints';
import { refPrice24h } from '../lib/infoClient';

const COIN = 'BTC';

export default function useBtc24h() {
  const [price, setPrice] = useState(null);
  const [ref24h, setRef24h] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => { (async () => {
    try { setRef24h(await refPrice24h(COIN)); }
    catch (e) { setError(e.message); }
  })(); }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => {
      setStatus('live');
      ws.send(JSON.stringify({ method:'subscribe', subscription:{ type:'allMids' } }));
    };
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg?.channel === 'allMids' && msg?.data?.mids) {
          const v = msg.data.mids['BTC'] ?? msg.data.mids['UBTC'];
          if (v != null) setPrice(Number(v));
        }
      } catch {}
    };
    ws.onerror = () => { setStatus('error'); setError('WS_ERROR'); };
    return () => ws.close();
  }, []);

  const hasDelta = price != null && ref24h != null;
  const deltaAbs = hasDelta ? price - ref24h : null;
  const deltaPct = hasDelta ? ((price / ref24h - 1) * 100) : null;

  return { price, deltaAbs, deltaPct, status, error };
}
