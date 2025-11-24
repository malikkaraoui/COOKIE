// Bouton de navigation vers la page Profil
// S'affiche dans la Sidebar uniquement quand l'utilisateur est connecté
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useButtonHover } from '../hooks/useHover'
import './auth.css'

export default function ProfileButton() {
  const { user } = useAuth()
  const { hoverHandlers, buttonStyle } = useButtonHover({
    baseColor: '#6f5a72',
    hoverColor: '#8b7490',
    baseBackground: 'transparent',
    hoverBackground: 'rgba(111, 90, 114, 0.1)',
  })

  // N'affiche rien si l'utilisateur n'est pas connecté
  if (!user) {
    return null
  }

  return (
    <Link 
      to="/profile" 
      className="profile-button"
      style={buttonStyle}
      {...hoverHandlers}
    >
      <svg className="profile-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
      <span>Profil</span>
    </Link>
  )
}
