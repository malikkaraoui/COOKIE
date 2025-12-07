import { useCallback } from 'react'
import { useAppKitWallet } from '@reown/appkit-wallet-button/react'
import { useDisconnect } from '@reown/appkit/react'

type Namespace = 'eip155' | 'solana' | 'bip122'

type SocialProvider = 'google' | 'github' | 'apple' | 'facebook' | 'x' | 'discord' | 'farcaster'

export type ReownAuthMethods = {
  loginWithEmail: (email?: string) => Promise<unknown>
  loginWithSocial: (provider: SocialProvider) => Promise<unknown>
  loginWithWallet: (wallet: string) => Promise<unknown>
  logoutReownUser: () => Promise<void>
  isPending: boolean
}

export function useReownAuth(namespace: Namespace = 'eip155'): ReownAuthMethods {
  const { connect, isPending } = useAppKitWallet({ namespace })
  const { disconnect } = useDisconnect()

  const loginWithEmail = useCallback(
    async (email?: string) => {
      return connect('email', email ? { email } : undefined)
    },
    [connect],
  )

  const loginWithSocial = useCallback(
    async (provider: SocialProvider) => {
      return connect(provider)
    },
    [connect],
  )

  const loginWithWallet = useCallback(
    async (wallet: string) => {
      return connect(wallet)
    },
    [connect],
  )

  const logoutReownUser = useCallback(async () => {
    await disconnect({ namespace })
  }, [disconnect, namespace])

  return {
    loginWithEmail,
    loginWithSocial,
    loginWithWallet,
    logoutReownUser,
    isPending,
  }
}
