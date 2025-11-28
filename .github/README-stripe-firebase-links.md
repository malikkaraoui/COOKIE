# README – Stripe + Firebase Functions v2 (Liens utiles)

Ce fichier rassemble les liens essentiels pour configurer **Stripe Webhooks** avec **Firebase Functions v2** (HTTP `onRequest` + `defineSecret` + vérification de signature).

---

## 1. Firebase – Fonctions HTTP (`onRequest`, v1 & v2)

**Call functions via HTTP requests (Cloud Functions for Firebase)**  
Guide officiel pour créer et appeler des fonctions HTTP Firebase (1st & 2nd gen) :  
https://firebase.google.com/docs/functions/http-events

---

## 2. Firebase – Configuration de l’environnement & secrets

**Configure your environment (2nd gen, paramètres & env)**  
Utilisation des variables d’environnement et des **secrets gérés** (`defineSecret`) :  
https://firebase.google.com/docs/functions/config-env

**Configure your environment (1st gen)**  
Ancienne méthode via `functions.config()`, utile pour historique / comparaison :  
https://firebase.google.com/docs/functions/1st-gen/config-env-1st

**Secure API Keys with 2nd-Gen Cloud Functions (Code with Andrea)**  
Article montrant comment utiliser `defineSecret` avec Stripe (API keys + Functions v2) :  
https://codewithandrea.com/articles/api-keys-2ndgen-cloud-functions-firebase/

---

## 3. Stripe – Webhooks & signature

**Webhooks – Vue d’ensemble (EN)**  
Concepts généraux des webhooks, configuration des endpoints, événements, retries :  
https://docs.stripe.com/webhooks

**Webhooks – Vue d’ensemble (FR)**  
Version française de la doc webhooks Stripe :  
https://docs.stripe.com/webhooks?locale=fr-FR

**Vérification de la signature des webhooks (FR)**  
Explication de `Stripe-Signature`, du calcul HMAC, et de `stripe.webhooks.constructEvent` :  
https://docs.stripe.com/webhooks/signature?locale=fr-FR

**Quickstart – Set up and deploy a webhook**  
Tutoriel officiel pour créer et tester un endpoint de webhook Stripe :  
https://docs.stripe.com/webhooks/quickstart

---

## 4. Articles & exemples concrets Stripe + Firebase

**Raw Body for Stripe Webhooks using Firebase Cloud Functions**  
Décrit comment accéder au body brut (`rawBody`) pour vérifier la signature Stripe côté Firebase :  
https://www.bitesite.ca/blog/raw-body-for-stripe-webhooks-using-firebase-cloud-functions

**Working with Stripe Webhooks & Firebase Cloud Functions**  
Exemple complet de traitement de webhooks Stripe dans Firebase (1st gen, mais logique identique) :  
https://medium.com/@GaryHarrower/working-with-stripe-webhooks-firebase-cloud-functions-5366c206c6c

**Stripe + Firebase – Fixer les erreurs de signature**  
Article expliquant les causes courantes des erreurs de signature (body modifié, encodage…) :  
https://varbintech.com/blog/stripe-angular-firebase-how-to-fix-webhook-signature-errors

---

## 5. Problèmes & discussions sur `rawBody` en Functions v2

**Thread Reddit – “Firebase functions v2 doesn't provide raw body access”**  
Discussion autour de `req.rawBody` en v2, contournements et retours d’expérience :  
https://www.reddit.com/r/Firebase/comments/1g1gl40/firebase_functions_v2_doesnt_provide_raw_body/

---

Tu peux déposer ce fichier dans ton repo (par exemple `docs/README-stripe-firebase-links.md`) pour garder ces ressources sous la main quand tu travailles sur le webhook Stripe + Firebase Functions v2.
