import { httpsCallable } from 'firebase/functions'
import { functions } from '../config/firebase'

const createWalletCustomTokenCallable = httpsCallable(functions, 'createWalletCustomToken')

export async function requestWalletCustomToken(walletAddress) {
  const normalizedAddress = typeof walletAddress === 'string' ? walletAddress.trim().toLowerCase() : ''

  if (!normalizedAddress) {
    throw new Error('walletAddress is required')
  }

  const response = await createWalletCustomTokenCallable({ walletAddress: normalizedAddress })
  const token = response?.data?.token
  const uid = response?.data?.uid

  if (!token) {
    throw new Error('Token Firebase manquant dans la réponse')
  }

  return { token, uid }
}
