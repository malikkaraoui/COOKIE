/**
 * Toast - Notification temporaire en bas de l'écran
 * Affiche un message pendant 3 secondes puis disparaît
 */

import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 2000) // 2 secondes au lieu de 3
    
    return () => clearTimeout(timer)
  }, [onClose])

  const styles = {
    success: { bg: '#22c55e', icon: '✅' },
    warning: { bg: '#f59e0b', icon: '⚠️' },
    error: { bg: '#ef4444', icon: '❌' },
    info: { bg: '#3b82f6', icon: 'ℹ️' }
  }

  const style = styles[type] || styles.success

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: style.bg,
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        zIndex: 10001,
        fontSize: '16px',
        fontWeight: '600',
        animation: 'slideUp 0.3s ease-out',
        maxWidth: '90vw',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span style={{ fontSize: '20px' }}>{style.icon}</span>
      <span>{message}</span>
    </div>
  )
}
