# Paiement Stripe

## Workflow global

1. **Front Premium** (page *Acheter Premium*) déclenche la Function callable `createCheckoutSession` avec l’origine courante.
2. **Cloud Function** crée la session Checkout (mode `payment`, SKU `price_1SXm7qFjMYughYGelI6oUFMo`) et renvoie l’URL sécurisée.
3. **Utilisateur** règle sur la page Stripe hébergée.
4. **Webhook `handleStripeWebhook`** valide l’événement (`checkout.session.completed`) et marque l’utilisateur comme Premium dans RTDB.
5. **Front** écoute `/users/{uid}/membership` et `/users/{uid}/products/COOKIE_PREMIUM`. Si `active === true`, les fonctionnalités Premium (ordre Hyperliquid, watchers, Marmite avancée) se débloquent.

## Exemple de fonction callable

```ts
// functions/index.js
exports.createCheckoutSession = onCall({ secrets: [stripeSecret] }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Utilisateur non authentifié");
  }
  const origin = request.data?.origin ?? "http://localhost:5173";
  const successUrl = origin.replace(/\/$/, "") + "/stripe-success";
  const cancelUrl = origin.replace(/\/$/, "") + "/stripe-cancel";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: "price_1SXm7qFjMYughYGelI6oUFMo", quantity: 1 }],
    client_reference_id: request.auth.uid,
    customer_email: request.auth.token?.email,
    metadata: { uid: request.auth.uid },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { url: session.url };
});
```

## Webhook

- **Fichier** : `functions/stripeWebhooks.js` (importé depuis `functions/index.js`).
- **Étapes** : vérifie la signature, lit `event.type`, met à jour `/users/{uid}` selon `client_reference_id` ou `metadata.uid`.
- **Effets** :
  - `users/{uid}/membership = { active: true, status: "active", since: Date.now() }`
  - `users/{uid}/products/COOKIE_PREMIUM = { acquired: true, acquiredAt: Date.now() }`

### Payload simplifié

```json
{
  "id": "evt_1Pxxx",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_a1b2",
      "client_reference_id": "uid_123",
      "metadata": { "uid": "uid_123" },
      "customer_email": "user@example.com",
      "amount_total": 900,
      "currency": "eur"
    }
  }
}
```

## Lecture côté front

Le front écoute `users/{uid}/membership.active`. Exemple dans un hook (pseudo-code) :

```ts
import { onValue, ref } from 'firebase/database'

export function usePremiumStatus(uid) {
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    if (!uid) return
    return onValue(ref(db, `users/${uid}/membership`), (snapshot) => {
      setIsPremium(Boolean(snapshot.val()?.active))
    })
  }, [uid])

  return isPremium
}
```

Cette valeur conditionne l’accès aux sections sensibles (ordre Hyperliquid, watchers, statistiques avancées).
