# deployStripeWebhookFunction.md

> **But de ce fichier**  
> Ce document est destiné à **GitHub Copilot** dans le projet **COOKIE**.  
> Il décrit **exactement** comment créer et maintenir la fonction Firebase `handleStripeWebhook` qui reçoit les webhooks Stripe, **vérifie cryptographiquement la signature** et met à jour la Realtime Database pour indiquer si un paiement est **succès** ou **failed**.

Copilot doit suivre ces instructions **à la lettre**.  
Ne JAMAIS “simplifier” la sécurité en supprimant la vérification de signature.

---

## 1. Contexte technique du projet

- Backend : **Firebase Functions 2nd gen** (`firebase-functions/v2/https`), runtime Node.js 24.
- Base de données : **Firebase Realtime Database**.
- Authentification : Firebase Auth (les utilisateurs ont un `uid`).
- Paiement : **Stripe Checkout**.  
  - Une fonction `createCheckoutSession` existe déjà et crée une `checkout.session`.
  - La session Stripe doit toujours contenir `metadata.uid` pour identifier l’utilisateur Firebase.
- L’utilisateur “premium” est stocké dans la RTDB sous la forme :
  - `users/{uid}/membership`
  - `users/{uid}/products/COOKIE_PREMIUM`

---

## 2. Rôle de la fonction `handleStripeWebhook`

La fonction `handleStripeWebhook` est un **endpoint HTTPS** appelé **uniquement par Stripe** via les webhooks.

Cette fonction doit :

1. **Vérifier la signature Stripe** avec :
   - le header `Stripe-Signature`
   - le **body brut** (`req.rawBody`)
   - le secret de webhook `STRIPE_WEBHOOK_SECRET`
2. Refuser tout appel non signé ou mal signé (HTTP 400).
3. En cas d’événements pertinents :
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed` (optionnel)
4. Mettre à jour la RTDB pour refléter l’état du paiement :
   - Succès → `membership.active = true`, `membership.status = "active"`
   - Échec/expiré → `membership.active = false`, `membership.status = "failed"`

---

## 3. Pré-requis pour Copilot

Copilot doit vérifier / garantir les points suivants dans le dossier `functions` :

1. **Dépendances** dans `functions/package.json` :

   ```jsonc
   {
     "dependencies": {
       "firebase-admin": "^latest",
       "firebase-functions": "^latest",
       "stripe": "^latest"
     },
     "engines": {
       "node": "24"
     }
   }
   ```

2. **Initialisation Firebase Admin**

   Dans le point d’entrée (souvent `functions/index.js`), il doit exister :

   ```js
   const admin = require("firebase-admin");

   if (!admin.apps.length) {
     admin.initializeApp();
   }
   ```

   - Ne pas ré-initialiser `admin` plusieurs fois.
   - Si ce bloc existe déjà, Copilot ne doit pas le dupliquer.

3. **Import v2** déjà utilisés :

   ```js
   const { onRequest } = require("firebase-functions/v2/https");
   const logger = require("firebase-functions/logger");
   const { defineSecret } = require("firebase-functions/params");
   ```

   Si ces imports n’existent pas, Copilot doit les ajouter **une seule fois**.

4. **Secrets configurés côté Firebase** (manuellement par le développeur) :

   - `STRIPE_SECRET_KEY` (clé secrète Stripe, type `sk_test_...` ou `sk_live_...`)
   - `STRIPE_WEBHOOK_SECRET` (secret de webhook, type `whsec_...`)

   Copilot **ne crée pas** ces secrets : ils sont gérés par CLI :

   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   ```

---

## 4. Implémentation demandée à Copilot

### 4.1. Déclaration des secrets Stripe

Copilot doit déclarer les secrets **en haut du fichier** (juste après les imports) :

```js
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRYPE_WEBHOOK_SECRET");
```

### 4.2. Fonction `handleStripeWebhook` (v2 sécurisée)

Copilot doit soit :

- **Créer** `exports.handleStripeWebhook` si elle n’existe pas,  
- soit **remplacer entièrement** l’implémentation actuelle de `handleStripeWebhook` par **celle-ci** :

```js
exports.handleStripeWebhook = onRequest(
  {
    region: "us-central1",
    secrets: [stripeSecret, stripeWebhookSecret],
    maxInstances: 1, // pour limiter la concurrence (optionnel mais conseillé)
  },
  async (req, res) => {
    // 1) Vérification de la méthode HTTP
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // 2) Récupérer la signature Stripe
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      logger.warn("⚠️ Stripe-Signature header manquant");
      return res.status(400).send("Missing Stripe-Signature header");
    }

    // 3) Vérification cryptographique du webhook via Stripe
    let event;
    try {
      const stripe = new Stripe(stripeSecret.value(), {
        apiVersion: "2024-06-20",
      });

      // 🔑 Utiliser le body BRUT fourni par Firebase Functions v2
      // Ne jamais utiliser JSON.stringify(req.body) ici.
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        stripeWebhookSecret.value()
      );

      logger.info("✅ Webhook Stripe vérifié", {
        type: event.type,
        id: event.id,
      });
    } catch (err) {
      logger.error("❌ Vérification de signature échouée", {
        error: err.message,
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 4) Traitement métier en fonction du type d'événement
    try {
      const db = admin.database();

      switch (event.type) {
        // 4.1. Paiement réussi (immédiat ou async)
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded": {
          /** @type {import('stripe').Stripe.Checkout.Session} */
          const session = event.data.object;
          const uid = session.metadata?.uid;

          if (!uid) {
            logger.warn("⚠️ UID manquant dans metadata pour une session complétée", {
              sessionId: session.id,
            });
            break;
          }

          logger.info("💳 Paiement SUCCESS", { uid, sessionId: session.id });

          await db.ref(`users/${uid}`).update({
            membership: {
              active: true,
              status: "active",
              tier: "premium",
              step: 1,
              since: admin.database.ServerValue.TIMESTAMP,
              stripeCustomerId: session.customer || null,
              stripeSessionId: session.id,
            },
            updatedAt: admin.database.ServerValue.TIMESTAMP,
          });

          await db
            .ref(`users/${uid}/products/COOKIE_PREMIUM`)
            .set({
              acquired: true,
              acquiredAt: admin.database.ServerValue.TIMESTAMP,
              price: session.amount_total / 100,
              currency: session.currency,
              stripeSessionId: session.id,
            });

          break;
        }

        // 4.2. Paiement échoué / expiré
        case "checkout.session.async_payment_failed":
        case "checkout.session.expired":
        case "payment_intent.payment_failed": {
          const obj = event.data.object;
          const metadata = obj.metadata || {};
          const uid = metadata.uid;

          if (!uid) {
            logger.warn(
              "⚠️ UID manquant sur un événement de failure",
              { type: event.type }
            );
            break;
          }

          logger.info("💥 Paiement FAILED", {
            uid,
            type: event.type,
          });

          await db.ref(`users/${uid}`).update({
            membership: {
              active: false,
              status: "failed",
              lastErrorEvent: event.type,
              lastErrorAt: admin.database.ServerValue.TIMESTAMP,
            },
            updatedAt: admin.database.ServerValue.TIMESTAMP,
          });

          break;
        }

        // 4.3. Autres événements Stripe (non gérés, mais logués)
        default: {
          logger.info("ℹ️ Event Stripe non géré (aucune action RTDB)", {
            type: event.type,
          });
        }
      }

      // 5) Toujours répondre 200 à Stripe si le traitement ne plante pas
      return res.json({ received: true });
    } catch (err) {
      logger.error("❌ Erreur lors du traitement métier du webhook", {
        error: err.message,
      });
      return res.status(500).send("Internal Error");
    }
  }
);
```

### 4.3. Règles à respecter pour Copilot

- **Ne jamais** :
  - transformer `req.rawBody` (pas de `JSON.stringify`, pas de `bodyParser` custom, pas de `toString()` avant `constructEvent`),
  - désactiver la vérification de signature,
  - logguer les secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- Utiliser `logger.info` et `logger.error` uniquement pour :
  - `event.type`, `event.id`
  - `uid`, `session.id`
  - les messages d’erreur génériques.

---

## 5. Configuration du webhook côté Stripe (rappel pour l’humain)

> Cette partie est pour le développeur humain, pas pour Copilot.

1. Aller dans **Stripe Dashboard → Developers → Webhooks**.
2. Créer un endpoint :
   - URL = `https://us-central1-<PROJECT_ID>.cloudfunctions.net/handleStripeWebhook`
   - Événements à écouter :
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`
     - `payment_intent.payment_failed` (optionnel)
3. Récupérer le **Signing secret** de cet endpoint (`whsec_...`) et le mettre dans Firebase :

   ```bash
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   ```

4. Déployer la fonction :

   ```bash
   firebase deploy --only functions:handleStripeWebhook
   ```

---

## 6. Tests à réaliser (Stripe CLI)

1. Se connecter à Stripe CLI :

   ```bash
   stripe login
   ```

2. Écouter les webhooks :

   ```bash
   stripe listen --forward-to https://us-central1-<PROJECT_ID>.cloudfunctions.net/handleStripeWebhook
   ```

3. Déclencher un event de test :

   ```bash
   stripe trigger checkout.session.completed
   ```

4. Vérifier dans :
   - **Firebase Console → Functions → handleStripeWebhook → Logs**
   - **Realtime Database → users/{uid}** (pour un vrai test avec un vrai `uid` dans `metadata`)

On doit voir :

- `✅ Webhook Stripe vérifié`
- `💳 Paiement SUCCESS` ou `💥 Paiement FAILED`
- `membership` mis à jour correctement.

---

## 7. Si `req.rawBody` est undefined (cas rare)

Si en production (pas dans l’émulateur) les logs montrent que `req.rawBody` est `undefined`, alors :

- vérifier que la fonction est bien une **Functions v2** (`onRequest` de `firebase-functions/v2/https`) et **pas wrapée dans un Express avec un body-parser custom** ;
- si un middleware Express existe déjà, il ne doit PAS parser le body avant l’appel à `constructEvent`.

En dernier recours, une fonction 1st gen dédiée au webhook Stripe peut être ajoutée, mais **par défaut la solution ci-dessus doit être utilisée**.

---

Fin du fichier `deployStripeWebhookFunction.md`.
