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
```
# instructionStripeWebhooks.md – Guide unique Stripe + Firebase

Document de référence pour tout ce qui concerne **Stripe Checkout**, **Firebase Functions v2** et **Realtime Database** dans COOKIE. Il fusionne les anciennes notes :
- `README-stripe-firebase-links.md`
- `instructionStripeWebhooks.md`
- `deployStripeWebhookFunction.md`

---

## Sommaire
1. [Contexte & flux actuel](#1-contexte--flux-actuel)
2. [Architecture cible](#2-architecture-cible)
3. [Pré-requis techniques](#3-pré-requis-techniques)
4. [Implémentation Firebase Functions](#4-implémentation-firebase-functions)
5. [Contrat Firebase Realtime Database](#5-contrat-firebase-realtime-database)
6. [Déploiement & tests](#6-déploiement--tests)
7. [Guidelines Copilot (à répéter)](#7-guidelines-copilot-à-répéter)
8. [Ressources officielles & articles](#8-ressources-officielles--articles)
9. [FAQ & dépannage](#9-faq--dépannage)

---

## 1. Contexte & flux actuel

Flux POC :
1. Le front appelle la fonction callable **`createCheckoutSession`**.
2. La fonction crée une session Stripe (9 € test) et renvoie `session.url`.
3. L’utilisateur est redirigé vers Stripe, puis revient sur `/stripe-success` ou `/stripe-cancel`.

Limite : la vérité du paiement dépend de l’URL visitée → fragile si l’utilisateur ferme l’onglet. Les webhooks deviennent donc la **source de vérité serveur**.

---

## 2. Architecture cible

- **Front** : continue d’afficher `/Stripe`, `/stripe-success`, `/stripe-cancel` pour l’UX.
- **Backend** : ajoute une fonction HTTP v2 `handleStripeWebhook` (source unique des statuts premium).
- **Stripe** : notifie automatiquement Firebase via webhooks sécurisés (signature HMAC + `req.rawBody`).

👉 L’UX reste inchangée, mais l’état premium est déterminé côté serveur.

Événements suivis (v1) :
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `payment_intent.payment_failed` (optionnel)

---

## 3. Pré-requis techniques

### Dépendances (`functions/package.json`)
```jsonc
{
  "dependencies": {
    "firebase-admin": "^latest",
    "firebase-functions": "^latest",
    "stripe": "^latest"
  },
  "engines": { "node": "24" }
}
```

### Initialisation Firebase Admin
```js
const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp();
}
```

### Imports Functions v2
```js
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
```

### Secrets obligatoires (CLI)
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:access STRIPE_SECRET_KEY
```

### Métadonnées Stripe
Chaque session Stripe **doit contenir** `metadata.uid` (uid Firebase). Sans ça, impossible de rattacher le paiement dans RTDB.

---

## 4. Implémentation Firebase Functions

### 4.1 Callable `createCheckoutSession`
- Fichier : `functions/index.js`.
- Pattern : `onCall({ secrets: [stripeSecret] }, async (request) => { ... })`.
- Toujours renvoyer `{ url: session.url }` et laisser le front rediriger.
- Ne jamais mettre la clé `sk_...` côté front. Elle doit provenir de `defineSecret("STRIPE_SECRET_KEY")`.

### 4.2 Webhook `handleStripeWebhook`
- Fichier recommandé : `functions/stripeWebhooks.js` exporté depuis `functions/index.js`.
- Signature obligatoire :
```js
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

exports.handleStripeWebhook = onRequest({
  region: "us-central1",
  secrets: [stripeSecret, stripeWebhookSecret],
  maxInstances: 1,
}, async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const signature = req.headers["stripe-signature"];
  if (!signature) return res.status(400).send("Missing Stripe-Signature header");

  let event;
  try {
    const stripe = new Stripe(stripeSecret.value(), { apiVersion: "2024-06-20" });
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      stripeWebhookSecret.value()
    );
    logger.info("✅ Webhook Stripe vérifié", { type: event.type, id: event.id });
  } catch (err) {
    logger.error("❌ Vérification de signature échouée", { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const db = admin.database();

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const uid = session.metadata?.uid;
        if (!uid) {
          logger.warn("UID manquant sur session complétée", { sessionId: session.id });
          break;
        }

        await markMembershipSuccess(db, uid, session);
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const obj = event.data.object;
        const uid = obj.metadata?.uid;
        if (!uid) {
          logger.warn("UID manquant sur failure", { type: event.type });
          break;
        }

        await markMembershipFailed(db, uid, event.type);
        break;
      }

      default:
        logger.info("Event Stripe ignoré", { type: event.type });
    }

    return res.json({ received: true });
  } catch (err) {
    logger.error("❌ Erreur traitement webhook", { error: err.message });
    return res.status(500).send("Internal Error");
  }
});
```

Helper suggéré :
```js
async function markMembershipSuccess(db, uid, session) {
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

  await db.ref(`users/${uid}/products/COOKIE_PREMIUM`).set({
    acquired: true,
    acquiredAt: admin.database.ServerValue.TIMESTAMP,
    price: session.amount_total / 100,
    currency: session.currency,
    stripeSessionId: session.id,
  });
}

async function markMembershipFailed(db, uid, eventType) {
  await db.ref(`users/${uid}`).update({
    membership: {
      active: false,
      status: "failed",
      lastErrorEvent: eventType,
      lastErrorAt: admin.database.ServerValue.TIMESTAMP,
    },
    updatedAt: admin.database.ServerValue.TIMESTAMP,
  });
}
```

⚠️ Ne jamais :
- convertir `req.rawBody` → string/JSON avant `constructEvent`.
- logguer les secrets.
- mélanger `onCall` et `onRequest` dans la même fonction.

---

## 5. Contrat Firebase Realtime Database

- `users/{uid}/membership`
  - `active`: `true|false`
  - `status`: `"active" | "failed"`
  - `tier`: `"premium"`
  - `since`: `ServerValue.TIMESTAMP`
  - `stripeCustomerId`, `stripeSessionId`
  - `lastErrorEvent`, `lastErrorAt` (si échec)

- `users/{uid}/products/COOKIE_PREMIUM`
  - `acquired`: booléen
  - `acquiredAt`: timestamp
  - `price`: nombre (en euros)
  - `currency`: ex `eur`
  - `stripeSessionId`

👉 Le webhook est le seul endroit où ces nœuds doivent être modifiés en fonction du paiement.

---

## 6. Déploiement & tests

### Setup webhook dans Stripe Dashboard
1. Developers → Webhooks → “Add endpoint”.
2. URL : `https://us-central1-cookie1-b3592.cloudfunctions.net/handleStripeWebhook` (adapter projet).
3. Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `payment_intent.payment_failed`.
4. Copier le secret `whsec_...` → `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`.

### Déploiement ciblé
```bash
firebase deploy --only functions:createCheckoutSession,functions:handleStripeWebhook
```

### Tests automatisables
```bash
stripe login
stripe listen --forward-to https://us-central1-cookie1-b3592.cloudfunctions.net/handleStripeWebhook
stripe trigger checkout.session.completed
```

### Tests manuels
1. `npm run dev` → `/Stripe` → paiement test `4242 4242 4242 4242`.
2. Vérifier `firebase functions:log --only handleStripeWebhook`.
3. Contrôler RTDB (`users/{uid}`) pour voir `membership` mis à jour.

---

## 7. Guidelines Copilot (à répéter)
1. Ne touche pas à `createCheckoutSession` sans consigne explicite.
2. Utilise **toujours** `defineSecret` pour `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`.
3. Backend = CommonJS + Functions v2 (`onCall`, `onRequest`).
4. Front = `httpsCallable` (pas de `fetch` direct sur les Cloud Functions publiées).
5. Pas de `functions.config()` ; cette API est supprimée en v7.
6. Laisse le script `lint` des Functions sur `echo "Skip lint"` tant que la config Node n’est pas prête.

---

## 8. Ressources officielles & articles

### Firebase
- HTTP Functions 1st/2nd gen : https://firebase.google.com/docs/functions/http-events
- Config & secrets v2 : https://firebase.google.com/docs/functions/config-env
- Config 1st gen (historique) : https://firebase.google.com/docs/functions/1st-gen/config-env-1st
- Tutoriel `defineSecret` + Stripe : https://codewithandrea.com/articles/api-keys-2ndgen-cloud-functions-firebase/

### Stripe
- Webhooks overview (EN) : https://docs.stripe.com/webhooks
- Webhooks overview (FR) : https://docs.stripe.com/webhooks?locale=fr-FR
- Signature HMAC (FR) : https://docs.stripe.com/webhooks/signature?locale=fr-FR
- Quickstart webhook : https://docs.stripe.com/webhooks/quickstart

### Blogs & retours d’expérience
- Raw body Firebase v2 : https://www.bitesite.ca/blog/raw-body-for-stripe-webhooks-using-firebase-cloud-functions
- Exemple complet Stripe + Firebase : https://medium.com/@GaryHarrower/working-with-stripe-webhooks-firebase-cloud-functions-5366c206c6c
- Déboguer les erreurs de signature : https://varbintech.com/blog/stripe-angular-firebase-how-to-fix-webhook-signature-errors
- Discussion `req.rawBody` v2 : https://www.reddit.com/r/Firebase/comments/1g1gl40/firebase_functions_v2_doesnt_provide_raw_body/

---

## 9. FAQ & dépannage

**Q : `req.rawBody` vaut `undefined` ?**  
A : Vérifie que la fonction est bien une Functions v2 pure (`onRequest`), sans Express ni middleware JSON. En dernier recours, créer une fonction 1st gen dédiée, mais la solution attendue reste `req.rawBody` natif v2.

**Q : La signature Stripe échoue ?**  
A : S’assurer que `req.rawBody` n’est pas altéré, que le header `Stripe-Signature` est transmis, et que le secret `whsec_...` correspond bien à l’endpoint en question. Voir la ressource Varbintech ci-dessus.

**Q : Comment rattacher l’utilisateur ?**  
A : Toujours mettre `metadata.uid` lors de la création de la session. Sans UID, le webhook loggue un warning et n’active pas le premium.

**Q : Peut-on gérer plusieurs produits ?**  
A : Oui, ajouter d’autres nœuds `users/{uid}/products/{SKU}` dans `markMembershipSuccess` selon le `price` ou la `metadata` de la session.

---

Fin du document unique Stripe × Firebase.
```
