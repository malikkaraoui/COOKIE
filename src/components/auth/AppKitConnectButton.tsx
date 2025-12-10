import { useEffect, type ComponentProps } from 'react'
import { AppKitButton, useAppKitState } from '@reown/appkit/react'
import './appkitConnectButton.css'
import { isReownProjectConfigured } from '../../lib/reown/appkitConfig'

type AppKitConnectButtonProps = ComponentProps<'div'> & {
  label?: string
}

export function AppKitConnectButton({ label = 'Connect Wallet', ...rest }: AppKitConnectButtonProps) {
  const { initialized, loading } = useAppKitState()

  useEffect(() => {
    if (import.meta.env?.DEV) {
      console.debug('[Reown/AppKit] État du bouton', { initialized, loading, hasProjectId: isReownProjectConfigured })
    }
  }, [initialized, loading])

  useEffect(() => {
    if (initialized) return

    const timeout = window.setTimeout(() => {
      console.warn(
        '[Reown/AppKit] Initialisation supérieure à 5s. Vérifie VITE_REOWN_PROJECT_ID, ton accès Cloud et les CSP (eval, frame, websocket).',
      )
    }, 5000)

    return () => clearTimeout(timeout)
  }, [initialized])

  const statusHint = !isReownProjectConfigured
    ? 'Ajoute VITE_REOWN_PROJECT_ID dans .env pour activer Reown.'
    : !initialized
      ? 'Initialisation de Reown…'
      : loading
        ? 'Connexion en cours…'
        : null

  return (
    <div className="appkit-connect-wrapper" data-appkit-ready={initialized} {...rest}>
      <AppKitButton label={label} />
      {statusHint && <span className="appkit-status-hint">{statusHint}</span>}
    </div>
  )
}
