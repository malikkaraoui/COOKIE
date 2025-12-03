import { useTokenIcon } from '../hooks/useTokenIcon'
import { formatUSD, formatSigned } from '../lib/formatters'

export default function BtcTile({ price, deltaAbs, deltaPct, status, source, error }) {
  const { iconPath, handleError } = useTokenIcon('BTC')
  const hasDelta = deltaAbs!=null && deltaPct!=null;
  const color = !hasDelta ? '#94a3b8' : deltaAbs>=0 ? '#22c55e' : '#ef4444';
  const formattedDeltaAbs = hasDelta ? formatSigned(deltaAbs, 0) : null
  const formattedDeltaPct = hasDelta ? formatSigned(deltaPct, 2) : null

  // Statut lisible
  let statusLabel = 'Chargement…'
  if (error) statusLabel = 'Erreur'
  else if (status === 'live') statusLabel = 'Live'
  else if (status === 'cached') statusLabel = 'Cache'
  else if (status === 'loading') statusLabel = 'Initialisation'

  // Source (Hyperliquid/Binance vs cache navigateur)
  const sourceLabel = source === 'hyperliquid' 
    ? 'Hyperliquid' 
    : (source === 'binance' ? 'Binance' : 'Navigateur')

  return (
    <div style={styles.card}>
      <img src={iconPath} alt="BTC" width={36} height={36} style={{marginRight:10}} onError={handleError} />
      <div style={{display:'flex',flexDirection:'column'}}>
        <div style={{...styles.delta, color, minHeight:16}}>
          {hasDelta ? `(${formattedDeltaAbs} / ${formattedDeltaPct}%)` : 'Variation...'}
        </div>
        <div style={styles.price}>{price!=null ? formatUSD(price) : '—'}</div>
        <div style={styles.sub}>
          {error && <span style={{color:'#ef4444'}}>⛔ {error}</span>}
          {!error && (
            <span>
              <span style={{color: status==='live' ? '#22c55e' : '#94a3b8'}}>{statusLabel}</span>
              {' • '}
              <span style={{color:'#64748b'}}>{sourceLabel}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
const styles={
  card:{display:'flex',alignItems:'center',padding:12,background:'#0f172a',color:'#e5e7eb',borderRadius:12,border:'1px solid #334155',width:300},
  delta:{fontSize:13,marginBottom:4}, price:{fontSize:22,fontWeight:700,lineHeight:1.2}, sub:{fontSize:11,color:'#94a3b8',marginTop:2}
};
