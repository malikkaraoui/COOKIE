import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { db } from '../config/firebase'
import { ref, update } from 'firebase/database'

export default function StripeSuccessPage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user || saved) return

    const uid = user.uid
    const now = Date.now()

    // Multi-location update pour ne rien écraser par erreur
    const updates = {}
    updates[`users/${uid}/membership/active`] = true
    updates[`users/${uid}/membership/tier`] = 'premium'
    updates[`users/${uid}/membership/step`] = 1
    updates[`users/${uid}/membership/since`] = now
    updates[`users/${uid}/products/COOKIE_PREMIUM`] = true
    updates[`users/${uid}/updatedAt`] = now

    update(ref(db), updates)
      .then(() => setSaved(true))
      .catch((e) => {
        console.error('Erreur maj membre après paiement:', e)
      })
  }, [user, saved])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Paiement réussi 🎉</h1>
      <p>Merci pour ton achat de COOKIE Premium (mode test).</p>
      {user && (
        <p style={{ marginTop: '0.5rem', color: '#16a34a' }}>
          Ton compte a été marqué comme premium (étape 1).
        </p>
      )}
    </div>
  );
}
