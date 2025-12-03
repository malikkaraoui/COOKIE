# CHANGELOG

Toutes les modifications majeures du projet COOKIE.

## [Unreleased]
- À définir.

## [2025-12-03] Ajustements carnet multi-ordre & avatar

### Frontend (React)
- `Page2.jsx` :
  - Détection dynamique de la précision prix (saisie manuelle, nudges, auto-price) avec mémorisation par ligne d’ordre.
  - Normalisation stricte des inputs numériques (validation, quantization et finalisation au blur).
  - Amélioration des valeurs par défaut (autoPrice/autoSize) lors de l’ajout/suppression d’ordres.
- `MarketDataProvider.jsx` : remise à zéro explicite du champ `error` lorsque Hyperliquid renvoie un tick valide, pour éviter les faux positifs.
- `useAvatar.js` : transition non bloquante + cache/mémoïsation du fallback SVG afin de supprimer les warnings React et stabiliser le rendu.

### Qualité
- `npm run build` & `npm run lint`.

## [2025-11-26] Intégration Stripe et fiabilisation APY (simulateur)

### Backend (Firebase Functions)
- `createCheckoutSession` (callable v2):
  - Refus des requêtes non authentifiées (barrière serveur).
  - Liaison de la session Stripe à l’utilisateur (`client_reference_id`, `metadata.uid`, `customer_email`).
- Aucun webhook ajouté pour l’instant afin d’éviter tout impact non désiré sur le flux existant.

### Frontend (React)
- Pages Stripe:
  - `StripePage.jsx`: bouton de paiement (appel `startStripeCheckout`).
  - `StripeSuccessPage.jsx`: page de succès (avec rattachement léger côté client si connecté).
  - `StripeCancelPage.jsx`: page d’annulation.
- Sidebar:
  - Lien « Acheter Premium » visible uniquement pour les utilisateurs connectés.

### Base de données (Realtime Database)
- Écritures existantes Binance/Hyperliquid conservées.
- Sur succès Stripe (côté client, temporaire):
  - Rattachement du produit `COOKIE_PREMIUM` à l’utilisateur.
  - Marquage `membership` étape 1 (`active: true`, `tier: 'premium'`).

### Simulateur « Ma Cuisine » (APY)
- Problème: APY affiché à 0% pour plusieurs tokens Binance malgré des variations présentes en DB.
- Correction (Option B):
  - Les sliders s’abonnent directement à la bonne source (Binance/Hyperliquid) via un nouveau composant `TokenWeightRow`.
  - Casting explicite de `deltaPct` et recalcul de secours via `price`/`prevDayPx` si `deltaPct` est manquant.

### Notes
- Déploiement ciblé recommandé:
  - `firebase deploy --only functions:createCheckoutSession` uniquement si le backend ou les secrets ont changé.
- Évolutions futures possibles:
  - Webhook Stripe pour sécuriser l’upgrade premium côté serveur.
  - Badge Premium global dans l’UI.
  - Consolidation des lectures (graphes/metrics) sur les mêmes subscriptions que les sliders pour une cohérence parfaite.
