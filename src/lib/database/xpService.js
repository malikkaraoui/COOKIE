import { ref, set, update } from 'firebase/database'
import { db } from '../../config/firebase'

const buildXpRef = (uid, key) => {
  if (!uid) {
    throw new Error('uid requis pour xpService')
  }
  return ref(db, `users/${uid}/xpSignals/${key}`)
}

export async function setActiveFundingSignal(uid, payload = {}) {
  if (!uid) return
  const now = Date.now()
  const normalized = {
    coin: payload.coin || null,
    mode: payload.mode || null,
    tradeId: payload.tradeId || null,
    entryTimeMs: payload.entryTimeMs || now,
    source: payload.source || 'cookie-ui',
    isOpen: true,
    updatedAt: now,
  }
  await set(buildXpRef(uid, 'activeFunding'), normalized)
}

export async function clearActiveFundingSignal(uid, extra = {}) {
  if (!uid) return
  const now = Date.now()
  const refToUpdate = buildXpRef(uid, 'activeFunding')
  await update(refToUpdate, {
    isOpen: false,
    closedAt: now,
    updatedAt: now,
    coin: extra.coin || null,
  })
}

export async function markWalletHeartbeat(uid, metadata = {}) {
  if (!uid) return
  const now = Date.now()
  await update(buildXpRef(uid, 'wallet'), {
    connected: true,
    lastSeenAt: now,
    provider: metadata.provider || 'google',
  })
}

export async function markWalletOffline(uid) {
  if (!uid) return
  const now = Date.now()
  await update(buildXpRef(uid, 'wallet'), {
    connected: false,
    lastSeenAt: now,
  })
}
