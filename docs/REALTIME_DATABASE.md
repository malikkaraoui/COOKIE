# 🔥 Architecture Firebase Realtime Database - COOKIE

## 📊 Structure de la base de données

### Architecture Dual-Source

Le projet utilise **Firebase Realtime Database** avec une architecture à trois nœuds principaux :

```javascript
/
├── priceTokenHyper/        # Prix des tokens Hyperliquid
│   ├── BTC/
│   │   ├── price: number
│   │   ├── prevDayPx: number
│   │   ├── deltaAbs: number
│   │   └── deltaPct: number
│   ├── ETH/
│   ├── SOL/
│   ├── BNB/              # BNB depuis Hyperliquid
│   ├── POL/
│   ├── kPEPE/
│   ├── AVAX/
│   ├── ATOM/
│   ├── APT/
│   └── ARB/
│
├── priceTokenBinance/      # Prix des tokens Binance Spot
│   ├── BTC/
│   ├── ETH/
│   ├── BNB/              # BNB depuis Binance (whitelist)
│   ├── SOL/
│   ├── XRP/
│   ├── ADA/
│   ├── ... (30 tokens)   # Voir binanceTrackedTokens.js
│   └── CAKE/
│
└── users/                  # Données utilisateurs
    └── {uid}/
        └── selectedTokens: ["SYMBOL:SOURCE", ...]  # Max 4 tokens
```

## 🎯 Format des Tokens

**Convention** : `'SYMBOL:SOURCE'`

Exemples :
- `'BTC:hyperliquid'` - Bitcoin depuis Hyperliquid
- `'BNB:binance'` - BNB depuis Binance Spot
- `'SOL:hyperliquid'` - Solana depuis Hyperliquid

**Cas spécial BNB** : Seul token présent dans **les deux sources**
- `/priceTokenHyper/BNB` - Prix Hyperliquid
- `/priceTokenBinance/BNB` - Prix Binance Spot

## 🔐 Règles de sécurité

```json
{
  "rules": {
    "priceTokenHyper": {
      ".read": true,
      ".write": false
    },
    "priceTokenBinance": {
      ".read": true,
      ".write": false
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "selectedTokens": {
          ".validate": "newData.isString() || (newData.hasChildren() && newData.val().length <= 4)"
        }
      }
    }
  }
}
```

**Points clés** :
- ✅ Lecture publique sur les prix (priceToken*)
- ❌ Écriture interdite côté client (seulement via scripts serveur)
- ✅ Users : lecture/écriture uniquement de son propre nœud
- ✅ Max 4 tokens dans `selectedTokens`

## 🚀 Flux de données

### 1. Polling Hyperliquid (10 tokens)
```
App.jsx → useEffect
→ setInterval(5000ms)
→ getHyperliquidTokenSymbols() (10 tokens)
→ fetch('/info' endpoint)
→ setCachedPriceHyper(coin, data)
→ Firebase: /priceTokenHyper/{coin}
```

### 2. Polling Binance (30 tokens via whitelist)
```
App.jsx → useBinancePrices()
→ setInterval(5000ms)
→ BINANCE_DEFAULT_TOKENS (30 tokens)
→ getBinanceTicker24hr(symbol)
→ setCachedPriceBinance(id, data)
→ Firebase: /priceTokenBinance/{id}
```

### 3. Sélection de tokens par utilisateur
```
User drag & drop token
→ addToken('SYMBOL:SOURCE')
→ Vérifie si symbol déjà présent (avant ':')
→ Si non : ajoute à selectedTokens (max 4)
→ saveSelectedTokens(uid, tokens)
→ Firebase: /users/{uid}/selectedTokens
```

### 4. Suppression de token (Ma cuisine uniquement)
```
User clique croix rouge
→ removeToken('SYMBOL:SOURCE')
→ Filter selectedTokens
→ saveSelectedTokens(uid, tokens)
→ IMPORTANT: Sauvegarde même si array vide (fix bug persistance)
```

## 📁 Architecture fichiers

```
src/
├── config/
│   ├── firebase.js                 # Config Firebase + init db
│   ├── tokenList.js                # 10 tokens Hyperliquid
│   ├── binanceConfig.js            # Config Binance API
│   └── binanceTrackedTokens.js     # Whitelist 30 tokens Binance
│
├── lib/
│   ├── database/
│   │   ├── priceCache.js           # setCachedPriceHyper/Binance
│   │   ├── userService.js          # saveSelectedTokens/loadSelectedTokens
│   │   ├── initFirebase.js         # initializePriceNodes
│   │   └── cleanupFirebase.js      # cleanupOldPriceCache
│   └── binance/
│       └── binanceClient.js        # getBinanceTicker24hr
│
├── context/
│   ├── MarketDataContext.jsx       # Polling Hyperliquid
│   └── SelectedTokensContext.jsx   # Gestion tokens utilisateur
│
└── hooks/
    ├── useToken.js                 # Hook Hyperliquid
    ├── useBinanceToken.js          # Hook Binance
    └── useBinancePrices.js         # Auto-polling 30 tokens
```

## 🎯 Cas de figure gérés

| Cas | Comportement |
|-----|--------------|
| **BNB dual-source** | Peut être ajouté depuis Hyperliquid OU Binance (pas les deux) |
| **Suppression token** | Sauvegarde array vide (fix bug persistance) |
| **Token déjà présent** | Vérifie symbol avant ':' pour éviter doublons |
| **Max 4 tokens** | `count >= 4` bloque l'ajout de nouveaux tokens |
| **User non connecté** | `selectedTokens` = [] (lecture seule) |
| **Cache Firebase** | Cleanup auto des prix > 24h (cleanupOldPriceCache) |
| **Drag disabled Ma cuisine** | `draggable={false}` dans TokenTile |
| **Prix < $0.01** | Précision 6 décimales (ex: kPEPE) |
| **Prix >= $0.01** | Précision 2 décimales |

## 🔧 Scripts d'initialisation

### 1. Initialiser les nœuds Firebase
```javascript
import { initializePriceNodes } from './lib/database/initFirebase'

// Dans App.jsx
useEffect(() => {
  initializePriceNodes()
}, [])
```

### 2. Cleanup automatique du cache
```javascript
import { cleanupOldPriceCache } from './lib/database/cleanupFirebase'

// Dans App.jsx
useEffect(() => {
  cleanupOldPriceCache()
}, [])
```

### 3. Migration array → objet (une seule fois)
```bash
node src/lib/database/migrateSelectedTokens.js
```

## 🐛 Bugs résolus

### Bug persistance BNB
**Symptôme** : BNB ne se supprimait pas de "Ma cuisine"
**Cause** : Guard `if (userTokens.length === 0) return` empêchait la sauvegarde d'array vide
**Fix** : Supprimé le guard, toujours sauvegarder même si vide

### Bug array → object
**Symptôme** : Firebase stockait `{0: "BNB:binance"}` au lieu de `["BNB:binance"]`
**Cause** : Mauvaise structure dans les anciennes écritures
**Fix** : Script migration + validation côté règles Firebase

### Bug TypeScript import
**Symptôme** : Page blanche "importing binding name 'BINANCE_DEFAULT_TOKENS' is not found"
**Cause** : Import depuis `.github/binanceTrackedTokens.ts` dans projet JS
**Fix** : Migration vers `src/config/binanceTrackedTokens.js`

## 📝 TODO futurs

- [ ] Ajouter authentification pour écriture prix (Cloud Functions)
- [ ] Implémenter cache côté serveur (réduire appels API)
- [ ] Ajouter historique prix (`/history/{coin}/{timestamp}`)
- [ ] Créer agrégations temps réel (avg, min, max 24h)
- [ ] WebSockets pour updates en temps réel (alternative au polling)
