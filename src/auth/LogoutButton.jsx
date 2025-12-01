// Composant de déconnexion pour la Sidebar
// S'affiche uniquement quand l'utilisateur est connecté
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getHoverLabelProps } from '../lib/ui/hoverLabels'
import './auth.css'

export default function LogoutButton({ isCompact = false }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const hoverLabelProps = getHoverLabelProps('Déconnexion')

  const handleLogout = async () => {
    try {
      await signOut()
      // Redirection vers Marmiton Communautaire après déconnexion
      navigate('/MarmitonCommunautaire')
    } catch (err) {
      console.error('Erreur de déconnexion:', err)
    }
  }

  // N'affiche rien si l'utilisateur n'est pas connecté
  if (!user) {
    return null
  }

  return (
    <button 
      onClick={handleLogout} 
      className={`logout-button nav-link ${isCompact ? 'nav-link--compact' : ''}`}
      {...hoverLabelProps}
      type="button"
    >
      <span className="nav-link-icon logout-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
      </span>
      {!isCompact && (
        <span className="nav-link-label">Déconnexion</span>
      )}
    </button>
  )
}
