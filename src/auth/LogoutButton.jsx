// Composant de déconnexion pour la Sidebar
// S'affiche uniquement quand l'utilisateur est connecté
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useButtonHover } from '../hooks/useHover'
import './auth.css'

export default function LogoutButton() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { hoverHandlers, buttonStyle } = useButtonHover({
    baseColor: '#ef4444',
    hoverColor: '#dc2626',
    baseBackground: 'transparent',
    hoverBackground: 'rgba(239, 68, 68, 0.1)',
  })

  const handleLogout = async () => {
    try {
      await signOut()
      // Redirection vers Marmiton Communautaire après déconnexion
      navigate('/MarmitonCommunautaire')
    } catch (error) {
      // L'erreur est déjà loggée dans le hook
    }
  }

  // N'affiche rien si l'utilisateur n'est pas connecté
  if (!user) {
    return null
  }

  return (
    <button 
      onClick={handleLogout} 
      className="logout-button"
      style={buttonStyle}
      {...hoverHandlers}
    >
      <svg className="logout-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
      </svg>
      <span>Déconnexion</span>
    </button>
  )
}
