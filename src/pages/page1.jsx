/**
 * Épicerie fine 🛒 - Page fusionnée Hyperliquid + Binance
 * Affiche TOUS les tokens disponibles avec indication de la source
 * Support drag & drop vers "Ma cuisine" (desktop) et clic (mobile)
 */

import TokenTile from '../elements/TokenTile'
import { TOKENS } from '../config/tokenList'
import { BINANCE_DEFAULT_TOKENS } from '../config/binanceTrackedTokens.js'
import { useSelectedTokens } from '../context/SelectedTokensContext'

export default function Page1() {
  const { addToken } = useSelectedTokens()

  // Combiner Hyperliquid (10 tokens) + Binance (30 tokens)
  // Afficher les tokens Hyperliquid en premier, puis Binance
  // Si un token existe dans les deux sources, afficher les deux versions
  
  const hyperliquidTokens = TOKENS.map(token => ({
    symbol: token.symbol,
    source: 'hyperliquid',
    color: token.color
  }))

  const binanceTokens = BINANCE_DEFAULT_TOKENS.map(token => ({
    symbol: token.id,
    source: 'binance',
    color: null // couleur gérée par TokenTile
  }))

  // Fusionner sans dédupliquer - on peut avoir BNB:hyperliquid ET BNB:binance
  const allTokens = [...hyperliquidTokens, ...binanceTokens]

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 32 }}>🛒</span>
        <h1 style={{ color: '#e5e7eb', margin: 0 }}>Épicerie fine</h1>
      </div>
      
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
        Glissez jusqu'à 4 Ingrédients vers "Ma cuisine" à cuisiner !! 👨🏼‍🍳
      </p>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16,
        padding: '12px 0',
        borderBottom: '1px solid #334155',
        marginBottom: 8
      }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          {hyperliquidTokens.length} tokens Hyperliquid
        </span>
        <span style={{ color: '#64748b' }}>•</span>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          {binanceTokens.length} tokens Binance
        </span>
        <span style={{ color: '#64748b' }}>•</span>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          {allTokens.length} total
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {allTokens.map((token, idx) => (
          <TokenTile 
            key={`${token.symbol}:${token.source}:${idx}`}
            symbol={token.symbol} 
            source={token.source} 
            draggable 
            onAddToken={addToken}
          />
        ))}
      </div>
    </div>
  )
}
