import { useCallback, useEffect, useMemo, useState } from 'react'
import { Power } from 'lucide-react'
import { useWalletIdentity } from '../../hooks/useWalletIdentity'
import { useReownAuth } from '../../lib/reown/auth'
import { getHoverLabelProps } from '../../lib/ui/hoverLabels'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { markWalletOffline } from '../../lib/database/xpService'
import './reownLogoutButton.css'

type ReownLogoutButtonProps = {
  isCompact?: boolean
}

type FeedbackTone = 'neutral' | 'success' | 'error'

type FeedbackState = {
  tone: FeedbackTone
  text: string
} | null

export function ReownLogoutButton({ isCompact = false }: ReownLogoutButtonProps) {
  const { isConnected, address } = useWalletIdentity('eip155')
  const { logoutReownUser, isPending } = useReownAuth('eip155')
  const [localPending, setLocalPending] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  const hoverLabelProps = getHoverLabelProps('Déconnexion Reown')

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 4000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const helper = useMemo(() => {
    if (feedback) return feedback
    if (!isConnected) {
      return { tone: 'neutral' as FeedbackTone, text: 'Aucun wallet Reown connecté' }
    }
    return null
  }, [feedback, isConnected])

  const disabled = !isConnected || isPending || localPending
  const statusLabel = localPending || isPending ? 'Déconnexion…' : 'Déconnexion Reown'

  const closeFirebaseWalletSession = useCallback(async () => {
    const currentUser = auth.currentUser
    if (!currentUser?.uid?.startsWith('wallet:')) {
      return false
    }
    try {
      await markWalletOffline(currentUser.uid)
      await firebaseSignOut(auth)
      return true
    } catch (error) {
      console.warn('[Reown] Impossible de fermer la session Firebase wallet', error)
      return false
    }
  }, [])

  const handleClick = async () => {
    if (disabled) return
    setLocalPending(true)
    try {
      await logoutReownUser()
      const closedFirebase = await closeFirebaseWalletSession()
      if (closedFirebase) {
        console.info('[Reown] Session Firebase wallet fermée après déconnexion', {
          walletAddress: address,
        })
        setFeedback({ tone: 'success', text: 'Sessions Reown + Firebase fermées' })
      } else {
        setFeedback({ tone: 'success', text: 'Session Reown fermée' })
      }
    } catch (error) {
      console.error('[Reown] Échec de la déconnexion', error)
      setFeedback({ tone: 'error', text: 'Erreur lors de la déconnexion Reown' })
    } finally {
      setLocalPending(false)
    }
  }

  return (
    <div className="reown-logout-wrapper" data-appkit-connected={isConnected}>
      <button
        type="button"
        className={`nav-link reown-logout-button ${isCompact ? 'nav-link--compact' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        {...hoverLabelProps}
      >
        <span className="nav-link-icon reown-logout-icon" aria-hidden="true">
          <Power size={18} strokeWidth={2} />
        </span>
        {!isCompact && <span className="nav-link-label">{statusLabel}</span>}
      </button>
      {!isCompact && helper && (
        <span className={`reown-logout-hint reown-logout-hint--${helper.tone}`} aria-live="polite">
          {helper.text}
        </span>
      )}
    </div>
  )
}
