````markdown
# Stripe Checkout – Instruction de Référence

Flux : le front appelle une **Firebase Function callable** (`createCheckoutSession`) qui crée une session Stripe Checkout (9 € – mode test). L’utilisateur est ensuite redirigé vers `/stripe-success` ou `/stripe-cancel`.

> ⚠️ **Jamais de clé `sk_` dans le front.** Tout passe par Firebase Secret Manager via `defineSecret`.

## 🗂️ Fichiers concernés

| Zone | Fichiers | Notes |
|------|----------|-------|
| Backend | `functions/index.js` | Contient `createCheckoutSession` (CommonJS + v2 `onCall`). |
| Front config | `src/config/firebase.js` | Exporte `functions` (région `us-central1`). |
| Front service | `src/lib/stripeCheckout.js` | Wrap `httpsCallable(functions, 'createCheckoutSession')`. |
| UI | `src/pages/StripePage.jsx`, `StripeSuccessPage.jsx`, `StripeCancelPage.jsx`, `src/components/AppLayout.jsx` | Pages + routes associées. |

## 🔐 Secrets Firebase

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY   # sk_test_...
firebase functions:secrets:access STRIPE_SECRET_KEY
```

Dans le code :

```js
const { defineSecret } = require("firebase-functions/params")
const stripeSecret = defineSecret("STRIPE_SECRET_KEY")
```

## 🧠 Backend – `functions/index.js`

```js
const { onCall, HttpsError } = require("firebase-functions/v2/https")
const { defineSecret } = require("firebase-functions/params")
const Stripe = require("stripe")

const stripeSecret = defineSecret("STRIPE_SECRET_KEY")

exports.createCheckoutSession = onCall({ secrets: [stripeSecret] }, async () => {
  const stripe = new Stripe(stripeSecret.value(), { apiVersion: "2024-06-20" })

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: "price_1SXm7qFjMYughYGelI6oUFMo", quantity: 1 }],
      success_url: "http://localhost:5173/stripe-success",
      cancel_url: "http://localhost:5173/stripe-cancel",
    })
    return { url: session.url }
  } catch (error) {
    throw new HttpsError("internal", error.message || "STRIPE_ERROR", {
      type: error.type,
      code: error.code,
    })
  }
})
```

> Ne jamais réintroduire `functions.config()` ou exposer la clé Stripe dans un fichier front.

## 💻 Front – service + page

```js
// src/lib/stripeCheckout.js
import { httpsCallable } from "firebase/functions"
import { functions } from "../config/firebase"

const createCheckoutSession = httpsCallable(functions, "createCheckoutSession")

export async function startStripeCheckout() {
  const { data } = await createCheckoutSession({})
  if (!data?.url) throw new Error("URL de session Stripe manquante")
  window.location.href = data.url
}
```

```jsx
// src/pages/StripePage.jsx
export default function StripePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleClick = async () => {
    setError(null)
    setLoading(true)
    try {
      await startStripeCheckout()
    } catch (e) {
      setError(e.message || 'Erreur inattendue')
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Stripe Checkout</h1>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Redirection…' : 'Payer avec Stripe'}
      </button>
      {error && <p>Erreur: {error}</p>}
    </div>
  )
}
```

Routes (`AppLayout.jsx`) :

```jsx
<Route path="/Stripe" element={<StripePage />} />
<Route path="/stripe-success" element={<StripeSuccessPage />} />
<Route path="/stripe-cancel" element={<StripeCancelPage />} />
```

## 🚀 Déploiement ciblé

```bash
firebase deploy --only functions:createCheckoutSession
firebase functions:log --only createCheckoutSession
```

## ➕ Aller plus loin

- Webhooks : voir [`../../.github/instructionStripeWebhooks.md`](../../.github/instructionStripeWebhooks.md)
- Déploiement dédié webhook : [`../../.github/deployStripeWebhookFunction.md`](../../.github/deployStripeWebhookFunction.md)
- Flux premium (activation utilisateur) : prévoir webhook `checkout.session.completed` → RTDB.

````