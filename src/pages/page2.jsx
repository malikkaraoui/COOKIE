/**
 * Ma Cuisine - Simulateur de Portfolio Crypto
 * Ajustez vos allocations et visualisez les performances
 */

import { useMemo, useState, useEffect, useRef } from 'react'
import TokenTile from '../elements/TokenTile'
import TokenWeightSlider from '../elements/TokenWeightSlider'
import TokenWeightRow from '../elements/TokenWeightRow'
import PortfolioResults from '../elements/PortfolioResults'
import PortfolioChart from '../elements/PortfolioChart'
import { usePortfolioSimulation } from '../hooks/usePortfolioSimulation'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import { useAuth } from '../hooks/useAuth'
import { useMarketData } from '../context/MarketDataContext'
import { getTokenConfig } from '../config/tokenList'
import { 
  getInitialCapital, 
  saveInitialCapital, 
  subscribeInitialCapital 
} from '../lib/database/userService'

// Composant interne pour bouton de suppression (adapté mobile)
function DeleteButton({ symbol, onRemove, isMobile }) {
  const size = isMobile ? 40 : 24
  const fontSize = isMobile ? 24 : 14
  const offset = isMobile ? -12 : -8

  return (
    <button
      onClick={onRemove}
      style={{
        position: 'absolute',
        top: offset,
        right: offset,
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#ef4444',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: fontSize,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        zIndex: 10
      }}
      title={`Retirer ${symbol}`}
    >
      ×
    </button>
  )
}

export default function Page2() {
  const [isMobile, setIsMobile] = useState(false)

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const { selectedTokens, removeToken, count } = useSelectedTokens()
  const { user } = useAuth()
  // Récupérer aussi 'tokens' pour re-mémoïser quand les prix/variations changent
  const { getToken, tokens } = useMarketData()

  const selectedSymbols = useMemo(() => {
    return selectedTokens.map(symbolWithSource => {
      const [symbol] = symbolWithSource.includes(':') 
        ? symbolWithSource.split(':') 
        : [symbolWithSource]
      return symbol
    })
  }, [selectedTokens])
  
  // Créer tokensData à partir des tokens sélectionnés via service
  const tokensData = useMemo(() => {
    // Pour chaque token, on doit récupérer ses données selon sa source
    const data = selectedTokens.map(symbolWithSource => {
      const [symbol, source] = symbolWithSource.includes(':')
        ? symbolWithSource.split(':')
        : [symbolWithSource, 'hyperliquid']
      
      // Récupérer données de marché depuis MarketDataContext
      // (qui contient maintenant Hyperliquid ET Binance)
      // Utiliser directement l'état 'tokens' pour que le useMemo réagisse
      const marketData = (tokens && tokens[symbol]) || getToken(symbol)
      
      // Récupérer config statique
      const config = getTokenConfig(symbol)
      
      // S'assurer que deltaPct est bien numérique (Firebase peut renvoyer une string)
      let rawDeltaPct = marketData && marketData.deltaPct != null ? marketData.deltaPct : 0
      const numericDeltaPct = typeof rawDeltaPct === 'string' ? parseFloat(rawDeltaPct) : rawDeltaPct

      // Filet de sécurité : recalcul si deltaPct demeure 0 mais price & prevDayPx présents
      let finalDeltaPct = numericDeltaPct
      if ((finalDeltaPct === 0 || isNaN(finalDeltaPct)) && marketData?.price != null && marketData?.prevDayPx != null && marketData.prevDayPx !== 0) {
        finalDeltaPct = ((marketData.price / marketData.prevDayPx - 1) * 100)
      }

      const tokenData = {
        symbol,
        source,
        deltaPct: finalDeltaPct || 0,
        color: config?.color || '#666',
        name: config?.name || symbol,
        price: marketData?.price || null,
        status: marketData?.status || 'loading'
      }
      
      // Log pour debug
      console.log(`🔍 Page2 tokensData ${symbol}:`, {
        source,
        rawDeltaPct,
        numericDeltaPct,
        finalDeltaPct: tokenData.deltaPct,
        price: tokenData.price,
        prevDayPx: marketData?.prevDayPx,
        marketDataSource: marketData?.source
      })
      
      return tokenData
    })
    
    return data
  }, [selectedTokens, getToken, tokens])
  
  // Simulateur de portfolio avec les tokens dynamiques
  const {
    capitalInitial,
    setCapitalInitial,
    weights,
    setWeight,
    resetWeights,
    results
  } = usePortfolioSimulation(1000, tokensData, selectedSymbols)

  const capitalDebounceRef = useRef(null)
  const isEditingCapitalRef = useRef(false)
  const lastSyncedCapitalRef = useRef(null)

  // Synchronise le capital initial avec Firebase quand l'utilisateur est connecté
  useEffect(() => {
    if (!user?.uid) {
      lastSyncedCapitalRef.current = null
      return
    }

    let isMounted = true
    let unsubscribe = null

    async function bootstrapCapital() {
      try {
        const remoteValue = await getInitialCapital(user.uid)
        if (!isMounted) return
        lastSyncedCapitalRef.current = remoteValue
        setCapitalInitial(remoteValue)
      } catch (error) {
        console.error('Erreur chargement capital initial:', error)
      }
    }

    bootstrapCapital()

    unsubscribe = subscribeInitialCapital(user.uid, (value) => {
      if (!isMounted || isEditingCapitalRef.current) return
      if (value == null) return
      const numericValue = typeof value === 'number' ? value : Number(value)
      if (!Number.isFinite(numericValue)) return
      if (lastSyncedCapitalRef.current === numericValue) return
      lastSyncedCapitalRef.current = numericValue
      setCapitalInitial(numericValue)
    })

    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [user?.uid, setCapitalInitial])

  useEffect(() => {
    return () => {
      if (capitalDebounceRef.current) {
        clearTimeout(capitalDebounceRef.current)
      }
    }
  }, [])

  const persistCapital = async (value) => {
    if (!user?.uid) return
    try {
      await saveInitialCapital(user.uid, value)
      lastSyncedCapitalRef.current = value
    } catch (error) {
      console.error('Erreur sauvegarde capital initial:', error)
    }
  }

  const handleCapitalChange = (newValue) => {
    setCapitalInitial(newValue)

    if (!user?.uid) {
      return
    }

    isEditingCapitalRef.current = true

    if (capitalDebounceRef.current) {
      clearTimeout(capitalDebounceRef.current)
    }

    capitalDebounceRef.current = setTimeout(() => {
      isEditingCapitalRef.current = false
      persistCapital(newValue)
    }, 600)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#e5e7eb', 
          fontSize: '32px', 
          fontWeight: 'bold',
          margin: 0,
          marginBottom: '8px'
        }}>
          Ma Cuisine 👨🏼‍🍳
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
          Simulateur de portfolio • Optimisez vos allocations
        </p>
      </div>

      {/* Capital Initial Slider */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #334155'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <label style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600' }}>
            💰 Capital Initial
          </label>
          <span style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>
            ${capitalInitial.toFixed(0)}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="10000"
          step="10"
          value={capitalInitial}
          onChange={(e) => handleCapitalChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '10px',
            borderRadius: '5px',
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((capitalInitial - 10) / 9990) * 100}%, #334155 ${((capitalInitial - 10) / 9990) * 100}%, #334155 100%)`,
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '8px',
          color: '#64748b',
          fontSize: '12px'
        }}>
          <span>$10</span>
          <span>$10,000</span>
        </div>
      </div>

      {/* Résultats */}
      <PortfolioResults results={results} />

      {/* Faders de poids */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #334155'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            🎚️ Répartition Portfolio
          </h3>
          <button
            onClick={resetWeights}
            style={{
              padding: '8px 16px',
              background: '#334155',
              color: '#e5e7eb',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
          >
            Réinitialiser
          </button>
        </div>

        {/* Sliders dynamiques (branchés sur la bonne source par symbole) */}
        {tokensData.map(token => (
          <TokenWeightRow
            key={token.symbol}
            symbol={token.symbol}
            source={token.source}
            weight={weights[token.symbol] || 0}
            onChange={(newWeight) => setWeight(token.symbol, newWeight)}
            color={token.color}
          />
        ))}

        {/* Total */}
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
            Total Allocation
          </span>
          <span style={{ 
            color: '#22c55e', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            100.0% ✓
          </span>
        </div>
      </div>

      {/* Graphique circulaire (Pie Chart) */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ 
          color: '#e5e7eb', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: 0,
          marginBottom: '24px'
        }}>
          📊 Visualisation Portfolio
        </h3>
        
        <PortfolioChart weights={weights} tokensData={tokensData} />
      </div>

      {/* Tokens sélectionnés (ancien affichage) */}
      {selectedTokens.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: '#64748b',
          background: '#1e293b',
          borderRadius: 12,
          border: '2px dashed #334155'
        }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Aucun token sélectionné</p>
          <p style={{ fontSize: 14 }}>
            {user
              ? 'Glissez des tokens depuis "Épicerie fine" pour les suivre ici'
              : 'Connectez-vous pour commencer à cuisiner'
            }
          </p>
        </div>
      ) : (
        <div>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            🔖 Mes Tokens Suivis ({count}/4)
          </h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {selectedTokens.map(symbolWithSource => {
              const [symbol, source] = symbolWithSource.includes(':') 
                ? symbolWithSource.split(':') 
                : [symbolWithSource, 'hyperliquid']
              
              return (
                <div key={symbolWithSource} style={{ position: 'relative' }}>
                  <TokenTile symbol={symbol} source={source} />
                  <DeleteButton 
                    symbol={symbol}
                    onRemove={() => removeToken(symbolWithSource)}
                    isMobile={isMobile}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
