import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { db } from '../config/firebase'
import { ref, onValue } from 'firebase/database'

export default function StripeSuccessPage() {
  const { user } = useAuth()
  const [membership, setMembership] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) return

    // Écouter la confirmation WEBHOOK depuis Firebase RTDB
    const membershipRef = ref(db, `users/${user.uid}/membership`)
    
    console.log('🔍 Attente confirmation webhook Stripe...')

    const unsubscribe = onValue(membershipRef, (snapshot) => {
      const data = snapshot.val()
      console.log('📊 Membership reçu:', data)
      
      setMembership(data)
      setChecking(false)
      
      if (data && data.active && data.tier === 'premium') {
        console.log('✅ Webhook confirmé - premium activé')
      }
    })

    return () => unsubscribe()
  }, [user])

  if (!user) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Connexion requise...</p>
      </div>
    )
  }

  if (checking) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Vérification du paiement...</h1>
        <p>⏳ Attente de la confirmation webhook Stripe...</p>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
          Cela peut prendre quelques secondes.
        </p>
      </div>
    )
  }

  if (!membership || !membership.active || membership.tier !== 'premium') {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>⚠️ Paiement non confirmé</h1>
        <p>Le webhook Stripe n'a pas encore validé ton paiement.</p>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
          Si tu viens de payer, attends quelques secondes et rafraîchis la page.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>✅ Paiement réussi !</h1>
      <p>Merci pour ton achat de COOKIE Premium.</p>
      <p style={{ marginTop: '0.5rem', color: '#16a34a' }}>
        ✅ Ton compte premium a été activé via webhook Stripe.
      </p>
    </div>
  )
}
