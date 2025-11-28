# instructionStripeWebhooks.md – Gestion des webhooks Stripe (COOKIE)

## 0. Contexte

Actuellement, le flux de paiement **COOKIE Premium (9 €)** fonctionne ainsi :

1. Le front appelle la fonction Firebase **`createCheckoutSession`** (callable).
2. La fonction crée une **session Stripe Checkout** et renvoie une `url`.
3. Le front redirige l’utilisateur vers Stripe.
4. Stripe renvoie l’utilisateur vers `success_url` (`/stripe-success`) ou `cancel_url` (`/stripe-cancel`), et on affiche un écran de confirmation côté front.

👉 Aujourd’hui, **la “vérité” du paiement** est déduite uniquement du fait que l’utilisateur arrive sur `/stripe-success`.  
C’est **OK pour un POC**, mais **fragile** : si le navigateur est fermé, si l’utilisateur ne revient pas, ou si quelqu’un manipule l’URL, tu n’as pas une source fiable côté serveur.

**Objectif des webhooks :**

- Laisser **Stripe notifier Firebase** (ton backend) quand un paiement est réellement **confirmé / échoué / remboursé**.
- Utiliser cette notification comme **source de vérité** pour :
  - marquer un utilisateur comme *premium*,
  - envoyer un e-mail,
  - prolonger / couper un abonnement, etc.

---

## 1. Rappel : qu’est-ce qu’un webhook Stripe ?

Un **webhook** = une URL sur ton backend que Stripe appelle **tout seul** quand un événement arrive, par ex. :

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `customer.subscription.created / updated / deleted`
- `invoice.payment_succeeded` (paiement de facture / abonnement)

Stripe envoie :

- un **HTTP POST** vers ton endpoint (`/handleStripeWebhook` par ex.),
- un **payload JSON** décrivant l’événement,
- un **header `Stripe-Signature`** qui permet de vérifier que l’appel vient bien de Stripe.

---

## 2. Evénements les plus utiles pour COOKIE (v1)

Pour l’instant tu vends **un produit unique** (COOKIE Premium 9 € – mode test).  
Les webhooks intéressants :

1. **`checkout.session.completed`**
   - Envoyé quand l’utilisateur a terminé le Checkout avec succès.
   - C’est l’événement **clé** pour marquer l’utilisateur comme “premium”.

2. **`payment_intent.payment_failed`**
   - Paiement refusé (fonds insuffisants, carte refusée, etc.).
   - Permet de loguer / éventuellement prévenir l’utilisateur.

3. **(plus tard) `charge.refunded`**
   - Utilisé si tu fais des remboursements et que tu veux mettre à jour l’état chez toi.

4. **(plus tard) abonnement :**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - → à utiliser quand tu vendras **des abonnements** (mensuel, annuel, etc.).

---

## 3. Architecture cible avec webhook

Pour l’instant : **on garde le flux existant**, on ajoute juste une couche backend plus robuste.

1. Le front :
   - continue de rediriger vers Stripe,
   - continue d’afficher `/stripe-success` à l’utilisateur pour l’UX.

2. Le backend (Firebase Functions) :
   - expose **une nouvelle fonction HTTP** type `onRequest`, par ex. `handleStripeWebhook`,
   - Stripe appelle cette URL quand un paiement est confirmé,
   - c’est cette fonction qui, **au calme**, met à jour Firebase (profil utilisateur, flags premium, etc.).

👉 **Source de vérité = Webhook**  
👉 **UX utilisateur = redirection + pages de succès / annulation**

---

## 4. Étapes concrètes – Webhook Stripe côté Firebase

### 4.1. Créer le webhook dans le dashboard Stripe

Dans Stripe (mode test) :

1. Aller dans **Developers → Webhooks**.
2. Cliquer sur **“Add endpoint” / “Ajouter un endpoint”**.
3. URL de l’endpoint (dev) – quand la fonction sera déployée, ce sera du genre :
   - `https://us-central1-cookie1-b3592.cloudfunctions.net/handleStripeWebhook`
4. Choisir les événements à écouter (au début) :
   - `checkout.session.completed`
   - (optionnel) `payment_intent.payment_failed`
5. Créer l’endpoint.
6. Stripe te donne un **“Signing secret”** (ex : `whsec_...`).

👉 **Ce “Signing secret” = `STRIPE_WEBHOOK_SECRET`**  
Tu ne le mets **jamais** dans le front. On va le stocker comme secret dans Firebase Functions.

---

### 4.2. Ajouter le secret de webhook dans Firebase

Dans le terminal à la racine du projet COOKIE :

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# Coller ici la valeur whsec_... fournie par Stripe pour CE webhook.
```

Tu peux vérifier :

```bash
firebase functions:secrets:access STRIPE_WEBHOOK_SECRET
```

---

### 4.3. Nouvelle fonction Firebase pour le webhook (dans un fichier séparé)

Objectif : **ne pas toucher** à `createCheckoutSession` plus que nécessaire.

#### 4.3.1. Créer `functions/stripeWebhooks.js`

```js
// functions/stripeWebhooks.js

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const Stripe = require("stripe");

// Secrets Stripe
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

exports.handleStripeWebhook = onRequest(
  { secrets: [stripeSecret, stripeWebhookSecret] },
  async (req, res) => {
    // Stripe n’envoie que des POST
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const sig = req.headers["stripe-signature"];

    let event;
    try {
      const stripe = new Stripe(stripeSecret.value(), {
        apiVersion: "2024-06-20",
      });

      // ⚠️ Important : utiliser req.rawBody pour la vérification de signature
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      logger.error("❌ Webhook Stripe: signature invalide", {
        message: err.message,
      });
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    logger.info("📩 Webhook Stripe reçu", { type: event.type });

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          // TODO: récupérer les infos utiles (client, email, metadata, etc.)
          logger.info("✅ checkout.session.completed", {
            sessionId: session.id,
            customer: session.customer,
            email: session.customer_details?.email || null,
          });

          // 👉 Ici, logique métier COOKIE :
          // - marquer l'utilisateur "premium" dans Firebase
          // - écrire un log dans la DB
          // - envoyer un email, etc.
          break;
        }

        case "payment_intent.payment_failed": {
          const pi = event.data.object;
          logger.warn("⚠️ payment_intent.payment_failed", {
            id: pi.id,
            reason: pi.last_payment_error?.message,
          });

          // TODO: loguer / notifier si tu le souhaites
          break;
        }

        default:
          logger.info("ℹ️ Event Stripe non géré explicitement", {
            type: event.type,
          });
      }

      res.json({ received: true });
    } catch (err) {
      logger.error("❌ Erreur interne lors du traitement du webhook", {
        message: err.message,
        stack: err.stack,
      });
      res.status(500).send("Internal error");
    }
  }
);
```

> Copilot :
> - Toujours utiliser `stripe.webhooks.constructEvent(req.rawBody, sig, stripeWebhookSecret.value())`.
> - Ne pas parser le body soi-même (`JSON.parse`) avant cette étape.
> - Ne pas mélanger “callable” (`onCall`) et “webhook HTTP” (`onRequest`) : ce sont deux fonctions différentes.

---

### 4.4. Brancher la fonction dans `functions/index.js` sans casser `createCheckoutSession`

Actuellement, `functions/index.js` contient déjà **`createCheckoutSession`** et utilise CommonJS.

Deux façons pour organiser :

#### Option simple (pour l’instant) : tout dans `index.js`

On peut **copier/coller** la fonction `handleStripeWebhook` directement dans `index.js`, sous `createCheckoutSession` :

```js
exports.createCheckoutSession = onCall(
  { secrets: [stripeSecret] },
  async (request) => {
    // ... code actuel
  }
);

// 👇 Ajouter handleStripeWebhook ici si tu ne veux pas de fichier séparé
exports.handleStripeWebhook = onRequest(
  { secrets: [stripeSecret, stripeWebhookSecret] },
  async (req, res) => {
    // ... code du webhook (voir stripeWebhooks.js)
  }
);
```

#### Option mieux structurée (recommandée quand tu seras à l’aise)

1. Garder `createCheckoutSession` dans `index.js`.
2. Mettre `handleStripeWebhook` dans `stripeWebhooks.js`.
3. Dans `index.js`, faire :

```js
// functions/index.js

// ... imports + createCheckoutSession ...

// Ajouter cette ligne en bas :
exports.handleStripeWebhook = require("./stripeWebhooks").handleStripeWebhook;
```

👉 Ça permet de **ne pas toucher** au code de `createCheckoutSession` et de juste brancher la nouvelle fonction.

---

### 4.5. Déployer uniquement la fonction webhook

Quand `handleStripeWebhook` est en place :

```bash
firebase deploy --only functions:handleStripeWebhook
```

Tu peux aussi déployer les deux (si tu as changé `index.js`) :

```bash
firebase deploy --only functions:createCheckoutSession,functions:handleStripeWebhook
```

---

## 5. Tester le webhook Stripe

### 5.1. Avec un vrai test de paiement (comme tu l’as déjà fait)

1. Lancer le front (`npm run dev`).
2. Aller sur `/Stripe`, lancer un paiement test.
3. Payer avec une carte de test (`4242 4242 4242 4242`).
4. Vérifier dans les logs :

```bash
firebase functions:log --only handleStripeWebhook
```

Tu dois voir :

- `📩 Webhook Stripe reçu`
- puis `✅ checkout.session.completed`

### 5.2. Avec le Stripe Dashboard

Dans **Developers → Webhooks** :

- Choisir ton endpoint → “Send test event”.
- Sélectionner `checkout.session.completed`.
- Envoyer l’événement.
- Regarder les logs Firebase.

---

## 6. À dire clairement à Copilot (guidelines)

Pour toutes futures fonctions Stripe / Firebase :

1. **Ne pas toucher** au code de `createCheckoutSession` sans raison explicite.
2. Pour la configuration Stripe (clé secrète / webhook secret) :
   - Utiliser `firebase functions:secrets:set ...`
   - Dans le code, utiliser **uniquement** `defineSecret("NOM_DU_SECRET")`
3. **Backend Firebase Functions = CommonJS + v2** :
   - `const X = require('...')`
   - `const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https")`
   - `exports.maFonction = onCall(...)` ou `exports.monWebhook = onRequest(...)`
4. **Front = ES Modules + callable** :
   - `import { httpsCallable } from "firebase/functions"`
   - `const fn = httpsCallable(functions, "nomDeLaFonction");`
5. Ne pas réintroduire `functions.config()` (API supprimée en v7, déjà cause de bugs).
6. Laisser `lint` dans `functions/package.json` comme :

   ```json
   "lint": "echo \"Skip lint\""
   ```

   tant que l’ESLint n’est pas configuré proprement pour Node/CommonJS.

---

## 7. Résumé

- **Aujourd’hui :**
  - `createCheckoutSession` gère la création de la session Stripe Checkout.
  - Le front affiche `/stripe-success` ou `/stripe-cancel`.

- **Avec les webhooks :**
  - `handleStripeWebhook` reçoit une notification **serveur à serveur** de Stripe.
  - C’est le **point central** pour mettre à jour la base de données (statut premium, abonnements, etc.).
  - Le front reste simple et concentré sur l’UX.

Ce fichier sert de **référence** pour toi et pour Copilot.  
Avant d’ajouter une nouvelle fonction Stripe :

- vérifier si elle doit être un **callable** (`onCall`) ou un **webhook HTTP** (`onRequest`),
- respecter les patterns ci-dessus,
- ne pas casser `createCheckoutSession` 🙃
