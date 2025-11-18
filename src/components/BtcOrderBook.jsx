import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../lib/hlEndpoints";

const COIN = "BTC";

function cell(n, align = "right") {
  return { padding: "2px 6px", textAlign: align, fontSize: 12, whiteSpace: "nowrap" };
}

export default function BtcOrderBook() {
  const [bids, setBids] = useState([]); // [{px, sz}]
  const [asks, setAsks] = useState([]); // [{px, sz}]
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "l2Book", coin: COIN } }));
    };
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg?.channel === "l2Book" && msg?.data?.levels) {
          const [rawBids, rawAsks] = msg.data.levels;
          const b = rawBids.map(l => ({ px: Number(l.px), sz: Number(l.sz) })).slice(0, 10);
          const a = rawAsks.map(l => ({ px: Number(l.px), sz: Number(l.sz) })).slice(0, 10);
          setBids(b);
          setAsks(a);
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  return (
    <div style={styles.wrap}>
      <div style={styles.head}>Order Book — {COIN}</div>
      <div style={styles.table}>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Asks (généralement affichés du plus bas au plus haut ; ici on garde l’ordre reçu) */}
          <div style={{ flex: 1 }}>
            <div style={styles.subhead}>Asks</div>
            {asks.map((l, i) => (
              <div key={"a"+i} style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ ...cell(l.px), color: "#ef4444" }}>{l.px.toLocaleString("fr-FR")}</div>
                <div style={cell(l.sz)}>{l.sz.toLocaleString("fr-FR", { maximumFractionDigits: 6 })}</div>
              </div>
            ))}
          </div>
          {/* Bids */}
          <div style={{ flex: 1 }}>
            <div style={styles.subhead}>Bids</div>
            {bids.map((l, i) => (
              <div key={"b"+i} style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ ...cell(l.px), color: "#22c55e" }}>{l.px.toLocaleString("fr-FR")}</div>
                <div style={cell(l.sz)}>{l.sz.toLocaleString("fr-FR", { maximumFractionDigits: 6 })}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.footer}>Flux: l2Book — top 10 niveaux</div>
    </div>
  );
}

const styles = {
  wrap: {
    background: "#0f172a",
    color: "#e5e7eb",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 12,
    width: 420,
  },
  head: { fontSize: 14, marginBottom: 6, color: "#94a3b8" },
  subhead: { fontSize: 12, marginBottom: 4, color: "#94a3b8" },
  table: { display: "block", gap: 8 },
  footer: { marginTop: 6, fontSize: 11, color: "#94a3b8" },
};
