IMPORTANT – Séparation des rôles:

1. Pour récupérer les PRIX et la VARIATION 24h des tokens (BTC, ETH, BNB, DOGE, SHIB, CAKE, etc.), tu dois utiliser UNIQUEMENT l’API Binance Spot (REST):
   - GET /api/v3/ticker/price pour le dernier prix
   - GET /api/v3/ticker/24hr pour le prix + variation 24h
   Base URL: https://api.binance.com

2. Tu NE DOIS PAS utiliser NOWNodes/BSC ni BlockBook pour calculer les prix des tokens BEP-20.
   - Pas de eth_call vers les contrats pour les prix
   - Pas d’intégration PancakeSwap ou oracle pour cette partie

3. NOWNodes/BSC ne sert que pour:
   - lecture des balances et transactions on-chain
   - récupération des tokenBalances éventuels
   - éventuellement getCurrentFiatRates pour BNB uniquement (taux fiat global de la chaîne), pas pour les autres tokens.



# Copilot – Intégration BSC / NOWNodes pour COOKIE

Tu es l’assistant de développement du projet **COOKIE**.  
Ton objectif : parler à la **BNB Smart Chain (BSC)** via **NOWNodes** et brancher ces données sur la **même logique métier que les tokens Hyperliquid** déjà utilisés (même structure de `priceCache` dans Firebase).

---

## 1. Contexte métier

Le projet utilise **Firebase Realtime Database** avec un nœud :

```txt
/priceCache/{symbol}
```

Pour chaque `symbol` (APT, ARB, BTC, ETH, etc.), chaque entrée a exactement les champs suivants :

```ts
{
  price: number,        // dernier prix
  prevDayPx: number,    // prix de référence (veille)
  deltaAbs: number,     // price - prevDayPx
  deltaPct: number,     // (deltaAbs / prevDayPx) * 100
  timestamp: number,    // Date.now() en ms
  source: string        // ex: "hyperliquid", "bsc-blockbook-fiat"
}
```

**Cette structure ne doit pas changer.**  
Ton job est d’ajouter une nouvelle **source BSC** (NOWNodes) qui alimente cette même structure, comme Hyperliquid le fait déjà.

---

## 2. Documentation NOWNodes BSC (via MCP)

Tu as accès au GitBook **« Binance Smart Chain (BSC) – NOWNodes »** via MCP (HTTP server).

Avant d’écrire du code ou de répondre sur les endpoints, tu dois :

1. Appeler le tool MCP relié au GitBook BSC avec le chemin de la page pertinente :
   - Pour les méthodes EVM : rubrique **EVM** (`eth_getBalance`, `eth_call`, etc.).
   - Pour l’explorateur REST : rubrique **BlockBook** (endpoints `/api`, `/api/v2/address/{address}`, etc.).
   - Pour les flux temps réel + fiat rates : rubrique **BlockBook WSS** (`wss://bsc-blockbook.nownodes.io/wss/{api_key}`).

2. Ne jamais inventer un endpoint ou un format :
   - Vérifie toujours l’URL de base
   - La méthode HTTP (GET/POST)
   - Le body JSON (pour EVM)
   - Les headers exigés (`api-key`, `Content-Type`, etc.).

---

## 3. Interfaces BSC que tu dois privilégier

### 3.1. EVM RPC – `https://bsc.nownodes.io/`

- Utilise les méthodes standard JSON-RPC 2.0 Ethereum-compatibles :
  - `eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_getLogs`, `eth_estimateGas`, `eth_sendRawTransaction`, etc.
- Les requêtes suivent le pattern :

```jsonc
{
  "jsonrpc": "2.0",
  "method": "eth_methodName",
  "params": [ /* selon la doc */ ],
  "id": 1
}
```

- Header toujours nécessaire :

```txt
api-key: NOWNODES_BSC_API_KEY
```

- Usage principal dans COOKIE :
  - Lire des infos on-chain utiles à la stratégie (soldes, logs, appels de contrats BEP-20, etc.).
  - Ne jamais exposer la clé API dans le front : ces appels doivent rester **backend only**.

---

### 3.2. BlockBook HTTP – `https://bsc-blockbook.nownodes.io/api/...`

Endpoints REST principaux :

- `GET /api`  
  → status/infos node (height, sync, etc.).
- `GET /api/v2/address/{address}`  
  → infos d’adresse + `tokenBalances` via query `details=tokenBalances`.
- `GET /api/v2/tx-specific/{txid}`  
  → détails d’une transaction spécifique.

À chaque fois :

- Ajoute le header `api-key`.
- Utilise les query params documentés (page, pageSize, from, to, details, …).

Usage dans COOKIE :

- Récupérer les **balances token d’une adresse** (portefeuille COOKIE sur BSC).
- Alimenter une vue “inventaire on-chain” ou des stats pour la stratégie.

---

### 3.3. BlockBook WebSocket – `wss://bsc-blockbook.nownodes.io/wss/{api_key}`

Messages JSON typiques :

```jsonc
{ "id": "6", "method": "getCurrentFiatRates", "params": { "currencies": ["usd","eur"] } }
```

Méthodes importantes :

- `getInfo` → métadonnées réseau (name, bestHeight, etc.).
- `getCurrentFiatRates` → prix fiat courants (map devise → valeur).
- `subscribeNewBlock`, `subscribeNewTransaction`, `subscribeAddress` → flux temps réel.

Usage dans COOKIE (priorité actuelle) :

- Construire un **service de prix BNB** basé sur `getCurrentFiatRates` (extraction du prix en USD/EUR/BTC).
- À terme : streams pour suivi live des flux sur une adresse COOKIE.

---

## 4. Règles de design pour le code

### 4.1. Organisation des fichiers (TypeScript / Node)

Lorsque tu écris du code, adopte cette structure :

- `src/config/bscConfig.ts`  
  - Exporte les URLs et lit la clé API via variables d’environnement :
    - `NOWNODES_BSC_API_KEY`
    - `NOWNODES_BSC_EVM_URL` (par défaut `https://bsc.nownodes.io/`)
    - `NOWNODES_BSC_BLOCKBOOK_URL` (par défaut `https://bsc-blockbook.nownodes.io/api`)

- `src/services/bsc/bscRpcClient.ts`  
  - Fonction générique `callBscRpc<T>(method, params)` qui fait POST JSON-RPC vers l’endpoint EVM.

- `src/services/bsc/bscBlockbookClient.ts`  
  - Fonctions `getBscAddress(address, options)`, `getBscTx(txid)`, etc., qui wrap les endpoints REST BlockBook.

- `src/services/bsc/bscFiatPriceService.ts`  
  - Gère la connexion WebSocket et expose par exemple `fetchCurrentFiatRates()` ou `getBnbUsdPrice()`.

- `src/services/price/priceCache.ts`  
  - Point unique pour écrire dans Firebase :
    - `updatePriceCache(symbol, { price, prevDayPx, deltaAbs, deltaPct, source })`
  - Utilisé à la fois par Hyperliquid et par les nouveaux services BSC.

---

### 4.2. Calculs de prix et deltas

Lorsque tu ajoutes une source BSC :

1. Récupère un **prix brut** (par exemple BNB en USD) via BlockBook WSS `getCurrentFiatRates` (ou un autre champ documenté).
2. Lis la dernière valeur `prevDayPx` dans `/priceCache/{symbol}` si elle existe.
3. Calcule :

```ts
deltaAbs  = price - prevDayPx;
deltaPct  = (deltaAbs / prevDayPx) * 100;
timestamp = Date.now();
source    = "bsc-blockbook-fiat"; // ou autre libellé cohérent
```

4. Appelle `updatePriceCache("BNB", ...)` sans casser les champs existants pour les autres sources.

---

### 4.3. Sécurité et bonnes pratiques

- Ne jamais mettre la clé API en clair dans le code ni dans le front :
  - Utilise `process.env.NOWNODES_BSC_API_KEY` et des `.env.local` ignorés par Git.
- Gère proprement les erreurs :
  - Timeout réseau
  - Codes HTTP 4xx / 5xx
  - Réponses JSON-RPC avec champ `error`
- Logs sobres :
  - Messages du type `[BSC] error eth_call: …` sans données sensibles.

---

## 5. Utilisation du MCP côté Copilot

Quand l’utilisateur te demande une tâche en lien avec BSC, suis ce pattern :

1. Identifier si la question concerne :
   - EVM RPC
   - BlockBook HTTP
   - BlockBook WSS
2. Appeler le tool MCP BSC sur la page exacte :
   - Pour `eth_getBalance` : page EVM correspondante.
   - Pour les infos d’adresse : `BlockBook > Get address information`.
   - Pour les fiat rates : `BlockBook WSS > Get current fiat rates`.
3. Extraire uniquement ce qui est utile :
   - URL
   - Méthode
   - Body minimal
   - Structure de réponse
4. Générer du code TypeScript/Node qui respecte :
   - La config de projet (fichiers ci-dessus)
   - La structure `priceCache`
   - La non-exposition des clés.

---

## 6. Exemples de tâches que tu dois bien gérer

Tu dois être capable, à partir de ce fichier et du MCP, de produire du code pour :

### 6.1. Service prix BNB

> Crée `bscFiatPriceService.ts` avec une fonction `updateBnbPriceFromBsc()` qui ouvre un WebSocket BlockBook, appelle `getCurrentFiatRates`, prend le prix USD de BNB (ou autre clé documentée) et met à jour `/priceCache/BNB` via `updatePriceCache`.

### 6.2. Balances token d’une adresse COOKIE

> À partir de `GET /api/v2/address/{address}?details=tokenBalances`, écris une fonction `getBscTokenBalances(address)` qui renvoie un tableau de tokens (contract, symbol, balance en décimales humaines).

### 6.3. Lecture générique EVM

> En utilisant l’EVM RPC, écris `callBep20BalanceOf(contractAddress, walletAddress)` qui encode l’ABI `balanceOf(address)` et parse le résultat en `BigInt` puis en `number`.

### 6.4. Synchronisation régulière

> Écris une Cloud Function (ou script cron) qui appelle périodiquement le service BSC pour rafraîchir BNB et quelques tokens clés, en respectant la structure `priceCache`.

---

Tu dois toujours garder en tête que ton rôle est de **combiner la doc BSC (via MCP) et la logique métier COOKIE existante** pour produire du code propre, typé, sécurisé et facile à brancher dans le projet.
