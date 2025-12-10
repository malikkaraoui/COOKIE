import { LogIn } from 'lucide-react'
import { getHoverLabelProps } from '../lib/ui/hoverLabels'
import './auth.css'

export default function LoginSidebarButton({ isCompact = false, onClick }) {
  const hoverLabelProps = getHoverLabelProps('Connexion')
  return (
    <button
      type="button"
      className={`login-sidebar-button nav-link ${isCompact ? 'nav-link--compact' : ''}`}
      onClick={onClick}
      {...hoverLabelProps}
    >
      <span className="nav-link-icon login-sidebar-icon">
        <LogIn size={18} strokeWidth={2.2} aria-hidden="true" />
      </span>
      {!isCompact && (
        <span className="nav-link-label">Connexion</span>
      )}
    </button>
  )
}
