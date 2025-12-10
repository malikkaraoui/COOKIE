# Back-end (Firebase Functions / RTDB)

## Panorama des Cloud Functions

| Fonction | Type | Rôle principal |
| --- | --- | --- |
| `bootstrapUserProfile` | Auth trigger (v1) | Initialise / met à jour le nœud `users/{uid}` lors d’une inscription.
| `createWalletCustomToken` | HTTPS callable | Génère un token custom pour l’auth Reown/wallet.
| `createCheckoutSession` | HTTPS callable | Prépare une session Stripe Checkout et renvoie l’URL.
| `handleStripeWebhook` | HTTP v1 | Valide les paiements et met à jour `/users/{uid}/products`.
| `hyperliquidInfoProxy` | HTTP v2 | Proxy vers l’API Hyperliquid (prix, funding, meta).
| `placeTestOrder` | HTTP | Déclenche un ordre perp Hyperliquid test.
| `listOpenOrders` | HTTP | Récupère les ordres ouverts Hyperliquid.
| `closeAllPositions` | HTTP | Ferme les positions Hyperliquid.
| `fundingMetrics` | HTTP | Agrège les métriques funding.
| `watchHyperliquidFunding` | Scheduler/HTTP | Surveille le funding, déclenche `maybeOpenFundingPosition` / `maybeCloseFundingPosition`.
| `runFundingStrategyTick` | HTTP | Tick manuel pour la stratégie funding.
| `getFundingStrategyState` / `upsertFundingStrategyState` | HTTP | Lire / persister l’état d’une stratégie dans RTDB.
| `placeBinanceSpotOrder` | HTTP | Passe un ordre spot via API Binance (testnet).
| `listBinanceOpenOrders` / `listBinanceSpotBalances` | HTTP | Lecture carnet / balances Binance.
| `cancelBinanceOpenOrdersOnSymbol`, `cancelAllBinanceOpenOrders`, `closeAndDustBinancePositions` | HTTP | Gestion / nettoyage des ordres Binance.
| `ccxtHistory` | HTTP | Expose l’historique multi-jours via CCXT (OHLC + rendements).

Toutes les fonctions TypeScript sont exportées depuis `functions/src/index.ts` puis re-exportées via `functions/index.js` (pont Node 22 + Stripe).

## Zoom sur quelques fonctions

### `hyperliquidInfoProxy`
- **Type** : HTTP onRequest v2.
- **Entrée** : query params (`symbol`, `resource`…).
- **Sortie** : JSON brut Hyperliquid (`metaAndAssetCtxs`, funding, open interest).
- **Usage** : alimenter les vues Épicerie et Ma Cuisine sans exposer la clé Hyperliquid côté client.

### `ccxtHistory`
- **Type** : HTTP.
- **Rôle** : interroge CCXT pour un ensemble de symboles, calcule séries et rendements (5/10/15/20 jours) puis renvoie `{ series: [...], returns: {...} }`.
- **Sécurité** : CORS limité, appelé depuis le front authentifié.

### `watchHyperliquidFunding`
- **Type** : scheduler / HTTP (selon configuration).
- **Rôle** : vérifie périodiquement le funding Hyperliquid pour décider d’ouvrir/fermer des positions. S’appuie sur `services/fundingService.ts` et stocke l’état sous `/hyperLiquidFundingStrategies/{strategyId}`.

### `placeTestOrder`
- **Type** : HTTP onRequest.
- **Entrée** : payload JSON `{ coin, size, limitPx, side }`.
- **Sortie** : confirmation Hyperliquid ou erreur.
- **Sécurité** : côté front, seuls les utilisateurs Premium peuvent l’afficher; côté serveur, prévoir des règles IP/secret si besoin.

### `createCheckoutSession`
```ts
export const createCheckoutSession = onCall({ secrets: [stripeSecret] }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Utilisateur non authentifié");
  }
  const origin = request.data?.origin ?? "http://localhost:5173";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: "price_1SXm7qFjMYughYGelI6oUFMo", quantity: 1 }],
    client_reference_id: request.auth.uid,
    success_url: `${origin}/stripe-success`,
    cancel_url: `${origin}/stripe-cancel`,
  });
  return { url: session.url };
});
```

### `handleStripeWebhook`
- **Type** : HTTP v1
- **Rôle** : vérifie la signature, marque `/users/{uid}/membership` et `/users/{uid}/products/COOKIE_PREMIUM` comme actifs.

### `bootstrapUserProfile`
- **Type** : `functions.auth.user().onCreate`
- **Rôle** : crée le profil avec `firstName`, `lastName`, `authProvider`, timestamps et flags `contactInfoCompleted`.

## Realtime Database

Nœuds principaux :

- `/users/{uid}` : profil, membership, produits, sélection d’ingrédients.
- `/priceTokenHyper/{symbol}` : dernier prix Hyperliquid, `prevDayPx`, `deltaPct`.
- `/priceTokenBinance/{symbol}` : équivalent côté Binance.
- `/hyperLiquidFundingStrategies/{strategyId}` : état complet d’une stratégie (positions ouvertes, paramètres, logs).
- `/binance/orders/{uid}` : traces d’ordres spot.
- `/notifications/{uid}` : messages utilisables par les toasts (optionnel selon implémentation).

### Règles de sécurité (résumé)

- Lecture/écriture sur `/users/{uid}` limitée à l’utilisateur authentifié.
- Nœuds prix (`/priceToken*`) accessibles en lecture seule.
- Nœuds stratégies/watcher protégés par rôle (serveur uniquement) via Custom Claims ou via règles `auth.token.admin == true`.

Les règles RTDB exactes sont stockées dans `database.rules.json`. Adapter ces descriptions si la structure change.
