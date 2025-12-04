# Instructions Copilot – Binance Spot API (Trading depuis le front)

> Objectif :  
> Reproduire pour Binance Spot ce qui existe déjà pour Hyperliquid :
> - Passer des ordres (market / limit) depuis le front
> - Lister les ordres ouverts (par symbole ou tous)
> - Annuler tous les ordres ouverts d’un coup (au moins par symbole, voire tous les symboles en boucle)
>
> Le tout **sans exposer la clé secrète** dans le front, en respectant la structure de projet (services / hooks / composants).

---

## 0. Architecture à respecter (très important)

1. **Le front React/Next ne parle JAMAIS directement à Binance**.  
   - Pas de clé API ni de signature dans le navigateur.
   - Le front ne parle qu’à **notre backend** (ex : Firebase Functions HTTP, API Node/Express, etc.).

2. Créer un client Binance Spot côté serveur :
   - Fichier conseillé : `src/services/binanceSpotClient.ts` (ou équivalent dans le dossier Node/Firebase).
   - Ce client :
     - Construit la query (timestamp, recvWindow…)
     - Signe la requête (`HMAC SHA256`)
     - Ajoute le header `X-MBX-APIKEY`
     - Envoie les requêtes HTTP à Binance.

3. Exposer des endpoints internes simples pour le front, par exemple :
   - `POST /api/trading/binance/order` → passer un ordre
   - `GET  /api/trading/binance/open-orders` → lister les ordres ouverts
   - `POST /api/trading/binance/cancel-all` → annuler les ordres (par symbole ou tous)

4. Le front utilise un **service front** :
   - Exemple : `src/services/trading/binanceApi.ts`
   - Ce service appelle *nos* endpoints, retourne des types propres (TypeScript) au reste de l’app.

---

## 1. Configuration & variables d’environnement

### 1.1. Clés et URLs

Côté backend uniquement, prévoir :

- `BINANCE_API_KEY` : clé API Spot.
- `BINANCE_API_SECRET` : clé secrète HMAC.
- `BINANCE_USE_TESTNET` : `true` ou `false`.
- `BINANCE_SPOT_BASE_URL` :
  - Prod : `https://api.binance.com/api`
  - Testnet (ancien) : `https://testnet.binance.vision/api`
  - Si tu veux être ultra à jour, prévois aussi une constante dédiée pour les URL de demo (Binance maintient parfois `https://demo-api.binance.com` pour sandbox).  
- Optionnel : `BINANCE_RECV_WINDOW` (par ex. `5000` ms).

> Idée : un petit helper `getBinanceBaseUrl()` qui renvoie la bonne URL en fonction de `BINANCE_USE_TESTNET`.

### 1.2. Permissions côté Binance

- La clé API doit au minimum avoir :
  - **Read** (lecture)
  - **Spot Trading (Enable Spot & Margin Trading)**
- **Pas de permission Withdraw via l’API** dans ce contexte.

---

## 2. Signature HMAC & helper générique

### 2.1. Rappel du mécanisme

Pour tous les endpoints `TRADE` et `USER_DATA` :

- On doit ajouter :
  - `timestamp` (en ms)
  - optionnel : `recvWindow` (par ex. `5000`)
- On signe tous les paramètres (`query string`) avec HMAC SHA256 en utilisant la clé secrète.
- On ajoute le résultat dans un paramètre `signature`.
- On met la clé publique dans l’en-tête HTTP `X-MBX-APIKEY`.

### 2.2. Helper TypeScript côté backend

Copilot doit créer un helper dans `src/services/binanceSpotClient.ts` :

- Une fonction `signParams(params: Record<string, string | number>): string` :
  - Ajoute `timestamp` s’il n’est pas présent.
  - Ajoute `recvWindow` si configuré.
  - Construit la query string avec `new URLSearchParams(...)`.
  - Calcule `signature` via `crypto.createHmac('sha256', BINANCE_API_SECRET).update(query).digest('hex')`.
  - Retourne la query string complète **avec** `signature`.

- Une fonction générique `binanceRequest` :
  ```ts
  type HttpMethod = 'GET' | 'POST' | 'DELETE';

  interface BinanceRequestOptions {
    path: string;              // ex: '/api/v3/order'
    method: HttpMethod;
    params?: Record<string, string | number | boolean | undefined>;
    securityType?: 'NONE' | 'TRADE' | 'USER_DATA';
  }
  ```
  - Si `securityType` est `TRADE` ou `USER_DATA`, signer la requête.
  - Gérer les paramètres :
    - `GET`/`DELETE` : params dans la query string.
    - `POST` : params dans le body `application/x-www-form-urlencoded` ou dans la query (au choix, mais rester cohérent).
  - Gérer les erreurs :
    - Si réponse JSON contient `{ code, msg }`, lever une erreur avec ces infos.
    - Logguer les réponses 4xx/5xx pour debug.

---

## 3. Passer des ordres Spot (`POST /api/v3/order`)

### 3.1. Endpoint Binance

- Endpoint : `POST /api/v3/order`
- Type sécurité : `TRADE`
- Paramètres minimums :
  - `symbol` (ex : `BTCUSDT`)
  - `side` : `BUY` ou `SELL`
  - `type` :
    - `MARKET`
    - `LIMIT`
  - En fonction du type :
    - `MARKET` : `quantity` **ou** `quoteOrderQty`
    - `LIMIT` : `timeInForce` (`GTC` en général), `quantity`, `price`

### 3.2. Type TypeScript pour une création d’ordre

Créer un type dans `src/types/binance.ts` (ou similaire) :

```ts
export type BinanceOrderSide = 'BUY' | 'SELL';
export type BinanceOrderType = 'LIMIT' | 'MARKET';

export interface CreateSpotOrderInput {
  symbol: string;              // ex "BTCUSDT"
  side: BinanceOrderSide;
  type: BinanceOrderType;
  quantity?: string;           // base asset
  quoteOrderQty?: string;      // quote asset
  price?: string;              // pour LIMIT
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  newClientOrderId?: string;   // id custom (ex: "cookie_xxx")
}
```

### 3.3. Fonction serveur : `placeSpotOrder`

Dans `binanceSpotClient.ts` :

```ts
export async function placeSpotOrder(input: CreateSpotOrderInput) {
  const params: Record<string, string> = {
    symbol: input.symbol,
    side: input.side,
    type: input.type,
  };

  if (input.type === 'LIMIT') {
    params.timeInForce = input.timeInForce ?? 'GTC';
    if (!input.price || !input.quantity) {
      throw new Error('LIMIT order requires price and quantity');
    }
    params.price = input.price;
    params.quantity = input.quantity;
  } else if (input.type === 'MARKET') {
    if (!input.quantity && !input.quoteOrderQty) {
      throw new Error('MARKET order requires quantity or quoteOrderQty');
    }
    if (input.quantity) params.quantity = input.quantity;
    if (input.quoteOrderQty) params.quoteOrderQty = input.quoteOrderQty;
  }

  if (input.newClientOrderId) {
    params.newClientOrderId = input.newClientOrderId;
  }

  return binanceRequest({
    path: '/api/v3/order',
    method: 'POST',
    params,
    securityType: 'TRADE',
  });
}
```

> À faire respecter par Copilot :  
> - Toujours utiliser `CreateSpotOrderInput` (ajouter des champs si besoin, mais ne pas casser ce contrat).  
> - Toujours passer par `binanceRequest`.

### 3.4. Endpoint interne pour le front

Exemple d’API interne (Firebase Function HTTP ou Express) :

- `POST /api/trading/binance/order`
  - Body : `CreateSpotOrderInput`
  - Appelle `placeSpotOrder`
  - Retourne la réponse Binance (ou un mapping simplifié).

Le front ne va donc jamais manipuler `signature`, `timestamp`, etc.

---

## 4. Lister les ordres ouverts (`GET /api/v3/openOrders`)

### 4.1. Endpoint Binance

- Endpoint : `GET /api/v3/openOrders`
- Type sécurité : `USER_DATA`
- Paramètres :
  - `symbol` (optionnel)
  - `timestamp` (obligatoire)
  - `recvWindow` (optionnel)

**Attention :**  
- Sans `symbol`, Binance renvoie **tous** les ordres ouverts de tous les symboles (poids de la requête plus élevé).
- Avec `symbol`, poids plus faible et réponse filtrée.

### 4.2. Type TypeScript

```ts
export interface BinanceOpenOrder {
  symbol: string;
  orderId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  status: string;      // NEW, PARTIALLY_FILLED, FILLED, CANCELED, etc.
  timeInForce: string;
  type: string;        // LIMIT, MARKET, ...
  side: BinanceOrderSide;
  stopPrice: string;
  icebergQty: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  origQuoteOrderQty: string;
}
```

### 4.3. Fonction serveur : `getOpenOrders`

```ts
export async function getOpenOrders(symbol?: string): Promise<BinanceOpenOrder[]> {
  const params: Record<string, string> = {};
  if (symbol) params.symbol = symbol;

  return binanceRequest({
    path: '/api/v3/openOrders',
    method: 'GET',
    params,
    securityType: 'USER_DATA',
  });
}
```

### 4.4. Endpoint interne pour le front

- `GET /api/trading/binance/open-orders`
  - Query optionnelle : `symbol=BTCUSDT`
  - Appelle `getOpenOrders(symbol)`.
  - Retourne soit :
    - Une liste brute de `BinanceOpenOrder[]`
    - Soit une version mappée (plus friendly pour l’UI).

---

## 5. Annuler tous les ordres (`DELETE /api/v3/openOrders`)

### 5.1. Ce que permet Binance nativement

- Endpoint : `DELETE /api/v3/openOrders`
- Type sécurité : `TRADE`
- Paramètre **obligatoire** : `symbol`  
  → Annule tous les ordres ouverts sur **un symbole donné**.

Il n’y a pas de route Spot officielle “annuler absolument tout sur tous les symboles” en un seul appel, mais on peut le simuler en 2 étapes :

1. `GET /api/v3/openOrders` sans `symbol` → récupère tous les ordres.
2. Extraire la liste des `symbol` uniques.
3. Pour chaque `symbol`, appeler `DELETE /api/v3/openOrders?symbol=XXX`.

### 5.2. Type TypeScript

```ts
export interface CancelAllOnSymbolInput {
  symbol: string;
}
```

### 5.3. Fonction serveur : `cancelAllOpenOrdersOnSymbol`

```ts
export async function cancelAllOpenOrdersOnSymbol(input: CancelAllOnSymbolInput) {
  const params = { symbol: input.symbol };

  return binanceRequest({
    path: '/api/v3/openOrders',
    method: 'DELETE',
    params,
    securityType: 'TRADE',
  });
}
```

### 5.4. Fonction serveur : “annuler tout partout”

```ts
export async function cancelAllOpenOrdersForAllSymbols() {
  const openOrders = await getOpenOrders(); // sans symbol => tous les ordres
  const symbols = Array.from(new Set(openOrders.map(o => o.symbol)));

  const results: Record<string, unknown> = {};

  for (const symbol of symbols) {
    try {
      const res = await cancelAllOpenOrdersOnSymbol({ symbol });
      results[symbol] = res;
    } catch (err) {
      // Log erreur par symbole, ne pas arrêter toute la boucle
      console.error(`Failed to cancel orders for ${symbol}`, err);
      results[symbol] = { error: (err as Error).message };
    }
  }

  return results;
}
```

### 5.5. Endpoint interne pour le front

Deux niveaux :

1. **Par symbole**  
   - `POST /api/trading/binance/cancel-all`
   - Body : `{ "symbol": "BTCUSDT" }`
   - Appelle `cancelAllOpenOrdersOnSymbol`.

2. **Global (tous symboles)**  
   - `POST /api/trading/binance/cancel-all-global`
   - Sans body, ou body `{ "scope": "all" }`
   - Appelle `cancelAllOpenOrdersForAllSymbols`.

---

## 6. Gestion des filtres & erreurs (qualité UX)

Pour éviter des erreurs côté utilisateur :

1. **Filtrer les quantités et prix** :
   - Utiliser `GET /api/v3/exchangeInfo` pour récupérer les filtres :
     - `LOT_SIZE` (minQty, maxQty, stepSize)
     - `PRICE_FILTER` (minPrice, maxPrice, tickSize)
   - Créer un helper pour arrondir `price` et `quantity` aux pas acceptés par le symbole.

2. **Compte & soldes** :
   - `GET /api/v3/account` → obtenir les balances pour l’UI.
   - Permet, par exemple, d’ajuster un slider “100% de ton USDT” sans dépasser.

3. **Rate limits** :
   - Sur dépassement, Binance renvoie souvent 429 / 418.
   - En cas de 429 :
     - Attendre le délai conseillé (header `Retry-After` si dispo).
     - Ne pas spammer ; sinon IP ban temporaire.

4. **Timeouts & statut inconnu** :
   - Si Binance renvoie un timeout avec “status unknown” :
     - Vérifier l’ordre via `GET /api/v3/order` en utilisant `symbol` + `orderId` ou `origClientOrderId`.

---

## 7. Agent API & rebates (optionnel mais compatible)

Tu as aussi les docs **Api-Agent** (rebates) :

- Base : `https://api.binance.com` + endpoints `/sapi/v1/apiReferral/...`
- Utilité :
  - Vérifier si un client est nouveau pour ton `apiAgentCode`.
  - Récupérer les historiques de rebates / kickbacks sur Spot.

Important pour Copilot :

- **Les ordres Spot se passent toujours via les endpoints `/api/v3/...`** (Trading & Account).
- Les endpoints “Api-Agent” servent à **gérer les rebates et la relation d’agent**, mais ne remplacent pas les endpoints de trading.
- Architecture recommandée :
  - Garder **un fichier** dédié aux endpoints rebates (ex : `binanceAgentApiClient.ts`).
  - Ne pas mélanger trading et rebates dans les mêmes fonctions.

---

## 8. Testnet vs Production

1. **Testnet** :
   - Base : `https://testnet.binance.vision/api` (ou URL “demo” selon la config la plus récente).
   - Les fonds sont fictifs, utilisables uniquement sur le testnet.
   - Idéal pour :
     - Valider la signature
     - Tester place/cancel/list d’ordres sans risque.

2. **Production** :
   - Base : `https://api.binance.com/api` (ou les variantes `api1`, `api2`, etc. pour haute dispo).
   - Clé API différente de la clé testnet.
   - Toujours :
     - Vérifier les quantités min / max.
     - Gérer sérieusement les erreurs et les logs.

3. **Stratégie Copilot** :
   - Quand tu lui demandes du code :
     - **Toujours** prévoir un flag `useTestnet` dans la config.
     - **Toujours** passer par `getBinanceBaseUrl()` pour éviter les hard-codes dans 15 fichiers.

---

## 9. Résumé pour “mode pilote automatique” (Copilot)

Quand tu demandes à Copilot :

> “Ajoute le support Binance Spot (ordre, liste, cancel-all) comme avec Hyperliquid”

Copilot doit :

1. **Côté backend**
   - Créer / compléter `binanceSpotClient.ts` avec :
     - `binanceRequest`
     - `placeSpotOrder`
     - `getOpenOrders`
     - `cancelAllOpenOrdersOnSymbol`
     - `cancelAllOpenOrdersForAllSymbols`
   - Utiliser les variables d’environnement listées plus haut.
   - Respecter la signature HMAC SHA256 (timestamp + recvWindow + signature).

2. **Côté API interne**
   - Exposer :
     - `POST /api/trading/binance/order`
     - `GET /api/trading/binance/open-orders`
     - `POST /api/trading/binance/cancel-all`
     - `POST /api/trading/binance/cancel-all-global`

3. **Côté front**
   - Créer un service front `src/services/trading/binanceApi.ts` qui :
     - Wrappe ces endpoints
     - Retourne des types clairs (`BinanceOpenOrder`, etc.).
   - Ne jamais manipuler les clés Binance ni la signature côté navigateur.

4. **Qualité**
   - Ajouter des commentaires clairs dans le code généré :
     - Rappels sur les filtres (`LOT_SIZE`, `PRICE_FILTER`)
     - Rappel sur l’usage testnet vs prod
     - Rappel sur la séparation front / backend.

---

> NOTE POUR LE FUTUR :  
> Si tu ajoutes plus tard les flux temps-réel (User Data Stream / WebSocket) :
> - Mets la logique WebSocket dans un autre fichier (`binanceUserDataStream.ts`).
> - Utilise ces flux uniquement pour **mettre à jour l’UI en temps réel**, pas pour remplacer les endpoints REST de base décrits ici.
