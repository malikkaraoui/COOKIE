import TokenTile from '../elements/TokenTile'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import { useAuth } from '../hooks/useAuth'

export default function Page2() {
  const { selectedTokens, removeToken, count } = useSelectedTokens()
  const { user } = useAuth()

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ color: '#e5e7eb', margin: 0 }}>Ma cuisine</h2>
        <span style={{ color: '#94a3b8', fontSize: 14 }}>
          {count}/4 tokens suivis
        </span>
      </div>

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
              ? 'Glissez des tokens depuis "Marmiton Communautaire" pour les suivre ici'
              : 'Connectez-vous pour commencer à cuisiner'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {selectedTokens.map(symbol => (
            <div key={symbol} style={{ position: 'relative' }}>
              <TokenTile symbol={symbol} />
              <button
                onClick={() => removeToken(symbol)}
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                title={`Retirer ${symbol}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
