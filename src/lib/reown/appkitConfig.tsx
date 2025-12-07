// @ts-nocheck
import { createAppKit, type CreateAppKitOptions } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter, type WagmiAdapterOptions } from '@reown/appkit-adapter-wagmi'
import { arbitrum, base, mainnet, polygon } from '@reown/appkit/networks'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

const projectId =
  import.meta.env?.VITE_REOWN_PROJECT_ID ??
  process.env?.NEXT_PUBLIC_REOWN_PROJECT_ID ??
  ''

export const reownProjectId = projectId
export const isReownProjectConfigured = Boolean(projectId)

if (!isReownProjectConfigured) {
  console.warn(
    '[Reown/AppKit] Aucun projectId trouvé. Ajoute VITE_REOWN_PROJECT_ID dans ton .env pour activer la connexion Reown.',
  )
} else {
  console.info('[Reown/AppKit] projectId chargé (longueur: %d)', projectId.length)
}

const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cookie.finance'

const metadata: CreateAppKitOptions['metadata'] = {
  name: 'COOKIE',
  description: 'Dashboard COOKIE avec Reown AppKit pour l’identification',
  url: appUrl,
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

export const supportedNetworks = [mainnet, arbitrum, base, polygon]

const wagmiOptions: WagmiAdapterOptions = {
  projectId,
  networks: supportedNetworks,
  ssr: true,
}

export const wagmiAdapter = new WagmiAdapter(wagmiOptions)

const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: supportedNetworks,
  metadata,
  features: {
    analytics: true,
  },
})

export const getAppKitInstance = () => appKit

export type AppKitOpenParams = Parameters<typeof appKit.open>[0]

export function openReownModal(options?: AppKitOpenParams) {
  return appKit.open(options)
}

export type AppKitProviderProps = {
  children: ReactNode
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
