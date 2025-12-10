# Architecture générale

## Vue d'ensemble

```
- Front-end : src/ (React, Vite, Tailwind, Context API, hooks personnalisés)
- Backend serverless : functions/ (Cloud Functions TypeScript + Node 22)
- Authentification : Firebase Auth (Google, wallet Reown via custom token)
- Données temps réel : Firebase Realtime Database (profils, prix, stratégies)
- Paiement : Stripe Checkout + Webhooks
- Integrations exchanges : Hyperliquid (perp) & Binance (spot), CCXT pour l’historique
```

Les dossiers majeurs :

- `src/` contient les pages métiers (`pages/page2.jsx` pour Ma Cuisine), composants (`elements/`, `components/`), hooks (`hooks/`), et services.
- `functions/` expose les handlers HTTP/callable (`handlers/`, `strategies/`, `services/`) compilés via `ts-node` + un pont Node 16 pour Stripe.
- `public/` et `assets/` servent aux ressources statiques.

## Flux principal

1. **Connexion** : l’utilisateur se connecte via Google ou via son wallet Hyperliquid (fonction `createWalletCustomToken`).
2. **Synchronisation** : le front lit `/users/{uid}` et les prix via le SDK RTDB (écoutes temps réel, `onValue`).
3. **Actions sensibles** : pour envoyer un ordre ou déclencher un watcher, le front appelle une Cloud Function HTTP/callable (ex : `placeTestOrder`, `watchHyperliquidFunding`).
4. **Écriture côté serveur** : les Functions écrivent dans RTDB (`/priceTokenHyper`, `/fundingStrategies`, `/binance/orders`) ou renvoient un payload au front.
5. **Interface vivante** : Ma Cuisine, Marmite ou Bouillon réagissent aux flux via Contexts et hooks (`useHyperliquidHistory`, `useCcxtHistory`).

## Schéma ASCII

```
[Utilisateur]
    ↓ Auth Firebase (Google / Wallet)
[Front React] --(fetch callable)--> [Cloud Functions]
    ↑ RTDB listeners          ↓                       ↓
 [Firebase RTDB] <---- write/update ----> Hyperliquid / Binance / Stripe
```
