import { useState } from 'react'
import { Lock, ShieldCheck, Sparkles } from 'lucide-react'
import { startStripeCheckout } from '../lib/stripeCheckout'
import './StripePage.css'

const PREMIUM_PLANS = [
  {
    id: 'mode-chef',
    badge: 'Chef officiel',
    title: 'Mode Chef',
    description: 'Débloquez toutes les recettes et soutenez le chef.',
    price: '9.99€',
    period: '/mois',
    features: [
      'Accès illimité aux recettes',
      'Badge "Chef" sur le profil',
      'Support prioritaire',
    ],
    cta: 'Devenir Chef',
    highlight: true,
    isReal: true,
  },
  {
    id: 'banquet-royal',
    badge: 'Soon™',
    title: 'Banquet Royal',
    description: 'Ne soyez plus limité par la taille de votre cuisine.',
    price: '14.99€',
    period: '/mois',
    features: [
      'Cuisinez avec 10+ ingrédients',
      'Création de recettes complexes',
      'Diversification maximale',
    ],
    cta: 'Agrandir ma cuisine',
    highlight: false,
    isReal: false,
  },
  {
    id: 'caisse-casino',
    badge: 'Sécurité',
    title: 'Caisse du Casino',
    description: 'L’outil ultime pour sécuriser vos gains en un éclair.',
    price: '4.99€',
    period: 'à vie',
    features: [
      'Bouton "Cash Out" global',
      'Fermez toutes vos positions en 1 clic',
      'Prenez vos profits avant le crash',
    ],
    cta: 'Acheter le coffre',
    highlight: false,
    isReal: false,
  },
]

const PROTECTION_PLAN = {
  title: 'Lait sur le Feu',
  description: 'Dormez sur vos deux oreilles, on veille aux grains.',
  price: '19.99€',
  period: '/mois',
  features: ['Surveillance 24/7', 'Stop-loss auto (-1% max / jour)', 'Protection anti-tempête'],
}

export default function StripePage() {
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)

  const handlePlanClick = async (plan) => {
    setInfoMessage(null)

    if (!plan.isReal) {
      setInfoMessage(`${plan.title} sera branché très bientôt. Pour l’instant, seul Mode Chef déclenche Stripe.`)
      return
    }

    setLoadingPlan(plan.id)
    try {
      await startStripeCheckout()
    } catch (error) {
      setInfoMessage(error.message || 'Impossible de lancer le paiement. Réessaie dans un instant.')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="stripe-page">
      <header className="stripe-hero">
        <span className="stripe-hero__eyebrow">Supporter officiel COOKIE</span>
        <h1>
          L’Épicerie <span>Premium</span>
        </h1>
        <p>
          Des outils professionnels pour les chefs qui ne laissent rien au hasard. Passez au niveau supérieur, obtenez le badge et débloquez chaque recette.
        </p>
      </header>

      {infoMessage && (
        <div className="stripe-info-banner">
          <Sparkles size={18} />
          <span>{infoMessage}</span>
        </div>
      )}

      <section className="stripe-plans-grid">
        {PREMIUM_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={[
              'stripe-plan-card',
              plan.highlight && 'stripe-plan-card--highlight',
            ].filter(Boolean).join(' ')}
          >
            <span className="stripe-plan-card__badge">{plan.badge}</span>
            <div>
              <h3 className="stripe-plan-card__title">{plan.title}</h3>
              <p className="stripe-plan-card__description">{plan.description}</p>
            </div>
            <div className="stripe-plan-card__price">
              <strong>{plan.price}</strong>
              <span className="stripe-plan-card__period">{plan.period}</span>
            </div>
            <ul className="stripe-plan-card__features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <ShieldCheck size={16} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={[
                'stripe-plan-card__cta',
                plan.isReal ? 'stripe-plan-card__cta--chef' : 'stripe-plan-card__cta--ghost',
              ].join(' ')}
              onClick={() => handlePlanClick(plan)}
              disabled={plan.isReal && loadingPlan && loadingPlan !== plan.id}
            >
              {plan.isReal && loadingPlan === plan.id ? 'Redirection…' : plan.cta}
            </button>
          </article>
        ))}
      </section>

      <section className="stripe-protection-card" aria-live="polite">
        <div>
          <p className="stripe-plan-card__badge" style={{ background: 'rgba(248,113,113,0.18)', color: '#b91c1c' }}>
            Protection anti-tempête
          </p>
          <h3>{PROTECTION_PLAN.title}</h3>
          <p className="stripe-plan-card__description">{PROTECTION_PLAN.description}</p>
        </div>
        <div className="stripe-protection-card__price">
          {PROTECTION_PLAN.price}
          <span className="stripe-plan-card__period" style={{ marginLeft: '8px' }}>
            {PROTECTION_PLAN.period}
          </span>
        </div>
        <ul className="stripe-protection-card__features">
          {PROTECTION_PLAN.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <button type="button" className="stripe-protection-card__cta" disabled>
          Activer la protection
        </button>
      </section>

      <footer className="stripe-legals">
        <span>
          <ShieldCheck size={16} /> Paiement sécurisé Stripe
        </span>
        <span>
          <Lock size={16} /> Activation immédiate
        </span>
        <span>
          <Sparkles size={16} /> Badge Chef appliqué dès la validation
        </span>
      </footer>
    </div>
  )
}
