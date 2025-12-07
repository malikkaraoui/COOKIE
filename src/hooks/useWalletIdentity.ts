import { useMemo } from 'react'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

export type WalletIdentity = {
  isConnected: boolean
  address: string | null
  chainId: number | string | null
  chainName: string | null
  namespace: 'eip155' | 'solana' | 'bip122'
}

export function useWalletIdentity(namespace: WalletIdentity['namespace'] = 'eip155'): WalletIdentity {
  const account = useAppKitAccount({ namespace })
  const network = useAppKitNetwork()

  return useMemo(() => {
    const isConnected = Boolean(account?.isConnected && account?.address)

    return {
      isConnected,
      address: account?.address ?? null,
      chainId: network?.chainId ?? null,
      chainName: network?.caipNetwork?.name ?? null,
      namespace,
    }
  }, [account?.address, account?.isConnected, network?.caipNetwork?.name, network?.chainId, namespace])
}
