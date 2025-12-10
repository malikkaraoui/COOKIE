import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { db } from '../config/firebase'
import { ref, onValue } from 'firebase/database'
import './StripeSuccessPage.css'

export default function StripeSuccessPage() {
  const { user } = useAuth()
  const [membership, setMembership] = useState(null)
  const [checking, setChecking] = useState(true)
  const [expired, setExpired] = useState(false)
  const navigate = useNavigate()
  const timeoutRef = useRef(null)
  const [blocked] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return localStorage.getItem('cookieStripeSuccessExpired') === 'true'
  })

  useEffect(() => {
    if (!blocked) {
      return
    }
    navigate('/ma-cuisine', { replace: true })
  }, [blocked, navigate])

  useEffect(() => {
    if (!user) return

    // Écouter la confirmation WEBHOOK depuis Firebase RTDB
    if (expired) {
      return
    }

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

    return () => {
      unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [user, expired])

  useEffect(() => {
    if (membership && membership.active && membership.tier === 'premium') {
      timeoutRef.current = setTimeout(() => {
        setExpired(true)
        localStorage.setItem('cookieStripeSuccessExpired', 'true')
        navigate('/ma-cuisine', { replace: true })
      }, 10000)
    }
  }, [membership, navigate])

  if (expired) {
    return null
  }

  if (blocked) {
    return null
  }

  if (!user) {
    return (
      <div className="stripe-success-page">
        <div className="stripe-success-info">
          <ShieldCheck size={22} />
          <div>
            <div>Validation sécurisée de ton badge Chef…</div>
            <small>
              Nous finalisons la confirmation Stripe. Si l’écran reste bloqué, identifie-toi puis reviens ici pour
              appliquer ton statut premium.
            </small>
          </div>
        </div>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="stripe-success-page">
        <div className="stripe-success-loader">
          <Clock size={20} />
          <div>Vérification du paiement en cours…</div>
          <small>Attente de la confirmation webhook Stripe. Cela peut prendre quelques secondes.</small>
        </div>
      </div>
    )
  }

  if (!membership || !membership.active || membership.tier !== 'premium') {
    return (
      <div className="stripe-success-page">
        <div className="stripe-success-warning">
          <TriangleAlert size={20} />
          <div>Webhook Stripe non confirmé</div>
          <small>
            Si tu viens de finaliser le paiement, patiente quelques instants puis actualise. Contacte le support si le
            problème persiste.
          </small>
        </div>
      </div>
    )
  }

  return (
    <div className="stripe-success-page">
      <article className="stripe-success-card">
        <div className="stripe-success-icon">
          <CheckCircle size={36} />
        </div>
        <h1>Paiement réussi !</h1>
        <p>Merci pour ton achat de COOKIE Premium.</p>
        <p className="stripe-success-status">
          <ShieldCheck size={18} /> Ton compte premium a été activé via webhook Stripe.
        </p>
      </article>
    </div>
  )
}
