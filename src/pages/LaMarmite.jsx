/**
 * La Marmite - Page de vote communautaire
 * Épargne collective avec décisions votées quotidiennement
 */

import { useState, useEffect } from 'react'
import { ChefHat } from 'lucide-react'

export default function LaMarmite() {
  // Chrono 8h (28800 secondes)
  const [timeLeft, setTimeLeft] = useState(8 * 60 * 60)
  const [selectedVote, setSelectedVote] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  // Décompte du temps
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  const handleVote = (choice) => {
    setSelectedVote(choice)
    setHasVoted(true)
  }

  return (
    <div style={{ 
      padding: '60px 40px',
      maxWidth: '1000px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '40px'
    }}>
      {/* Titre */}
      <h1 style={{ 
        fontSize: '48px', 
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        margin: 0
      }}>
        La Marmite Communautaire
      </h1>

      {/* Description */}
      <p style={{ 
        color: '#94a3b8', 
        fontSize: '18px',
        textAlign: 'center',
        lineHeight: '1.6',
        maxWidth: '700px',
        margin: 0
      }}>
        Une épargne gérée par la sagesse collective. Votez chaque jour, participez aux décisions, et partagez les rendements avec toute la communauté.
      </p>

      {/* Marmite géante */}
      <div style={{
        fontSize: '180px',
        lineHeight: 1,
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
        animation: 'float 3s ease-in-out infinite',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        🍲
      </div>

      {/* Section Vote */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '1px solid #334155'
      }}>
        {/* Header Question */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid #334155'
        }}>
          <ChefHat size={32} color="#f59e0b" strokeWidth={2} />
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              color: '#f59e0b', 
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '8px'
            }}>
              Question du Chef
            </h2>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              color: '#94a3b8',
              fontSize: '14px'
            }}>
              <span>Vote quotidien</span>
              <span>•</span>
              <span style={{ 
                color: timeLeft < 3600 ? '#ef4444' : '#22c55e',
                fontWeight: '600'
              }}>
                Expire dans {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <h3 style={{
          color: '#e5e7eb',
          fontSize: '22px',
          fontWeight: '600',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Quelle stratégie pour la marmite aujourd'hui ?
        </h3>

        {/* Options de vote */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Option 1 - Prudent */}
          <button
            onClick={() => handleVote('prudent')}
            disabled={hasVoted}
            style={{
              background: selectedVote === 'prudent' 
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
              border: selectedVote === 'prudent' ? '2px solid #22c55e' : '2px solid #475569',
              borderRadius: '16px',
              padding: '24px',
              cursor: hasVoted ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: hasVoted && selectedVote !== 'prudent' ? 0.5 : 1,
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (!hasVoted) e.currentTarget.style.transform = 'translateX(8px)'
            }}
            onMouseLeave={(e) => {
              if (!hasVoted) e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <div style={{ 
              color: selectedVote === 'prudent' ? '#fff' : '#e5e7eb', 
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              🛡️ Feu doux - Stratégie prudente
            </div>
            <div style={{ 
              color: selectedVote === 'prudent' ? '#f0fdf4' : '#94a3b8', 
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              On reste prudent et on laisse la marmite à feu doux. Stratégie défensive avec plus de cash et d'obligations.
            </div>
          </button>

          {/* Option 2 - Risqué */}
          <button
            onClick={() => handleVote('risque')}
            disabled={hasVoted}
            style={{
              background: selectedVote === 'risque' 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
              border: selectedVote === 'risque' ? '2px solid #ef4444' : '2px solid #475569',
              borderRadius: '16px',
              padding: '24px',
              cursor: hasVoted ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: hasVoted && selectedVote !== 'risque' ? 0.5 : 1,
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (!hasVoted) e.currentTarget.style.transform = 'translateX(8px)'
            }}
            onMouseLeave={(e) => {
              if (!hasVoted) e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <div style={{ 
              color: selectedVote === 'risque' ? '#fff' : '#e5e7eb', 
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              🌶️ Feu vif - Stratégie offensive
            </div>
            <div style={{ 
              color: selectedVote === 'risque' ? '#fef2f2' : '#94a3b8', 
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              On ajoute une pincée de piment et on augmente le risque pour chercher plus de rendement. Plus d'action tech et de crypto.
            </div>
          </button>
        </div>

        {/* Confirmation vote */}
        {hasVoted && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid #22c55e',
            borderRadius: '12px',
            color: '#22c55e',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            ✅ Vote enregistré ! Merci pour votre participation.
          </div>
        )}
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  )
}
