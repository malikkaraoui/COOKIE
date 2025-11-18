function narrowSpaces(str){ return str.replace(/\u00A0/g, "\u202F"); }
function fmtUSD(n){ return narrowSpaces(n.toLocaleString('fr-FR',{style:'currency',currency:'USD',maximumFractionDigits:2})); }
function fmtSignedAbs(n,d=0){ const s=n>=0?'':'-'; const a=Math.abs(n);
  return `${s}${a.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d})}`; }

export default function BtcTile({ price, deltaAbs, deltaPct, status, error }) {
  const hasDelta = deltaAbs!=null && deltaPct!=null;
  const color = !hasDelta ? '#94a3b8' : deltaAbs>=0 ? '#22c55e' : '#ef4444';
  return (
    <div style={styles.card}>
      <img src="/assets/btc.png" alt="BTC" width={36} height={36} style={{marginRight:10}} />
      <div style={{display:'flex',flexDirection:'column'}}>
        <div style={{...styles.delta, color}}>
          {hasDelta ? `(${fmtSignedAbs(deltaAbs,0)} / ${fmtSignedAbs(deltaPct,2)}%)` : '(calcul 24h…)'}
        </div>
        <div style={styles.price}>{price!=null ? fmtUSD(price) : '—'}</div>
        <div style={styles.sub}>{error ? <span style={{color:'#ef4444'}}>{error}</span> : (status==='live'?'WS: connecté':'Chargement…')}</div>
      </div>
    </div>
  );
}
const styles={
  card:{display:'flex',alignItems:'center',padding:12,background:'#0f172a',color:'#e5e7eb',borderRadius:12,border:'1px solid #334155',width:300},
  delta:{fontSize:13,marginBottom:4}, price:{fontSize:22,fontWeight:700,lineHeight:1.2}, sub:{fontSize:11,color:'#94a3b8',marginTop:2}
};
