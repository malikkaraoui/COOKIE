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

    // Écouter la confirmation webhook depuis Firebase RTDB
    const membershipRef = ref(db, `users/${user.uid}/membership`)
    
    console.log('🔍 StripeSuccessPage: écoute de la confirmation webhook...')

    const unsubscribe = onValue(membershipRef, (snapshot) => {
      const data = snapshot.val()
      console.log('📊 StripeSuccessPage: membership reçu', data)
      
      setMembership(data)
      setChecking(false)
      
      if (data && data.active && data.tier === 'premium') {
        console.log('✅ StripeSuccessPage: webhook confirmé, utilisateur premium')
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
        <p>⏳ En attente de la confirmation de Stripe...</p>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
          Cette page attend la réception du webhook de Stripe pour confirmer ton paiement.
        </p>
      </div>
    )
  }

  if (!membership || !membership.active || membership.tier !== 'premium') {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>⚠️ Paiement non confirmé</h1>
        <p>Le webhook Stripe n'a pas encore confirmé ton paiement.</p>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
          Si tu viens de payer, attends quelques secondes et rafraîchis la page.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Paiement réussi 🎉</h1>
      <p>Merci pour ton achat de COOKIE Premium.</p>
      <p style={{ marginTop: '0.5rem', color: '#16a34a' }}>
        ✅ Ton compte a été confirmé premium par Stripe (webhook reçu).
      </p>
      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
        Membre depuis : {new Date(membership.since).toLocaleString('fr-FR')}
      </p>
    </div>
  )
}
