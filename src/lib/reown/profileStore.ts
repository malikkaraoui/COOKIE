type ReownProfileRecord = {
  firstName?: string
  lastName?: string
  email?: string
  contactInfoCompleted?: boolean
  birthDate?: string | null
  createdAt?: number
  updatedAt?: number
}

const STORAGE_KEY = 'cookie.reownProfiles'

type ProfileDictionary = Record<string, ReownProfileRecord>

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStore(): ProfileDictionary {
  if (!isBrowser()) return {}
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch (error) {
    console.warn('[ReownProfileStore] Invalid JSON, resetting storage.', error)
    window.localStorage.removeItem(STORAGE_KEY)
    return {}
  }
}

function writeStore(next: ProfileDictionary) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (error) {
    console.warn('[ReownProfileStore] Unable to persist profile store.', error)
  }
}

export function getReownProfile(address?: string | null): ReownProfileRecord | null {
  if (!address) return null
  const store = readStore()
  return store[address.toLowerCase()] ?? null
}

export function saveReownProfile(address: string | null | undefined, data: Partial<ReownProfileRecord>): ReownProfileRecord | null {
  if (!address) return null
  const key = address.toLowerCase()
  const store = readStore()
  const previous = store[key] ?? {}
  const timestamp = Date.now()
  const next: ReownProfileRecord = {
    ...previous,
    ...data,
    updatedAt: timestamp,
    createdAt: previous.createdAt ?? timestamp,
  }
  store[key] = next
  writeStore(store)
  return next
}

export function clearReownProfile(address?: string | null) {
  if (!address) return
  const store = readStore()
  const key = address.toLowerCase()
  if (store[key]) {
    delete store[key]
    writeStore(store)
  }
}

export function isReownProfileComplete(profile: ReownProfileRecord | null | undefined): boolean {
  if (!profile) return false
  return Boolean(
    profile.contactInfoCompleted &&
    profile.firstName?.trim() &&
    profile.lastName?.trim() &&
    profile.email?.trim()
  )
}
