import { useEffect, useRef, useState } from 'react';
import { WS_URL } from '../lib/hlEndpoints';

const COIN = 'BTC';

export default function useBtc24h() {
  const [price, setPrice] = useState(null);      // prix live
  const [openDay, setOpenDay] = useState(null);  // open du candle 1d (réf "24h")
  const [status, setStatus] = useState('loading'); // loading | live | error | closed
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    let closing = false;   // pour ignorer les events au cleanup React (StrictMode)

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('live');
      // 1) prix live via allMids
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'allMids' }
      }));
      // 2) candle daily pour avoir l'open du jour
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'candle', coin: COIN, interval: '1d' }
      }));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        // Prix live
        if (msg?.channel === 'allMids' && msg?.data?.mids) {
          const mids = msg.data.mids;
          const v = mids[COIN] ?? mids['U' + COIN]; // BTC ou UBTC
          if (v != null) setPrice(Number(v));
        }

        // Candle 1d (open du jour)
        if (msg?.channel === 'candle' && msg?.data) {
          // suivant le format exact, ça peut être msg.data.candle ou msg.data
          const c = msg.data.candle ?? msg.data;
          const o = c?.o ?? c?.open;
          if (o != null) setOpenDay(Number(o));
        }
      } catch {
        // on ignore les messages non parsables
      }
    };

    ws.onerror = (e) => {
      if (closing) return;   // on ne signale pas d'erreur pendant un close volontaire
      console.error('WS error:', e);
      setStatus('error');
      setError('WS_ERROR');
    };

    ws.onclose = (ev) => {
      if (closing) return;   // fermeture demandée par notre cleanup
      if (ev.code === 1000) return; // fermeture "normale"
      console.warn('WS closed:', ev.code, ev.reason);
      setStatus('closed');
      setError(`WS_CLOSE_${ev.code || 0}`);
    };

    return () => {
      closing = true;
      try { ws.close(1000, 'app_cleanup'); } catch {}
    };
  }, []);

  // On considère l'open du daily candle comme la "référence 24h"
  const ref24h = openDay;
  const hasDelta = price != null && ref24h != null;
  const deltaAbs = hasDelta ? price - ref24h : null;
  const deltaPct = hasDelta ? ((price / ref24h - 1) * 100) : null;

  return { price, ref24h, deltaAbs, deltaPct, status, error };
}
