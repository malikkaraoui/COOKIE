import ProfileButton from '../auth/ProfileButton'
import LogoutButton from '../auth/LogoutButton'
import { useSidebarWidth } from '../context/SidebarWidthContext'
import { APP_VERSION } from '../config/version'

/**
 * Zone fixe en bas à gauche de l'écran
 * Toujours visible, indépendante du scroll de la sidebar
 * Synchronisée avec la largeur de la sidebar
 */
export default function SidebarFooter() {
  const { sidebarWidth } = useSidebarWidth()

  return (
    <div className="sidebar-footer-fixed" style={{ width: sidebarWidth }}>
      <div className="sidebar-version" aria-label="Version de l'application">
        {APP_VERSION}
      </div>
      <ProfileButton />
      <LogoutButton />
    </div>
  )
}
