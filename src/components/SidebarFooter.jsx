import ProfileButton from '../auth/ProfileButton'
import LogoutButton from '../auth/LogoutButton'
import { useSidebarWidth } from '../context/SidebarWidthContext'

/**
 * Zone fixe en bas à gauche de l'écran
 * Toujours visible, indépendante du scroll de la sidebar
 * Synchronisée avec la largeur de la sidebar
 */
export default function SidebarFooter() {
  const { sidebarWidth } = useSidebarWidth()

  return (
    <div className="sidebar-footer-fixed" style={{ width: sidebarWidth }}>
      <ProfileButton />
      <LogoutButton />
    </div>
  )
}
