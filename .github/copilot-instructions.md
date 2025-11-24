# 🍪 COOKIE - Instructions Copilot

## Vue d'ensemble

Application React de trading crypto avec **architecture dual-source** :
- **Hyperliquid API** : 10 tokens (BTC, ETH, SOL, BNB, MATIC, kPEPE, AVAX, ATOM, APT, ARB)
- **Binance Spot API** : BNB + tokens BEP-20 (extensible)
- **Firebase Realtime Database** : Cache prix + auth utilisateurs
- **Drag & Drop** : Sélection tokens personnalisée

---

## 🎯 Règles d'Architecture STRICTES

### App.jsx = MINIMAL (< 50 lignes)
```jsx
// ✅ BON : Uniquement composition + init
export default function App() {
  useEffect(() => {
    initializePriceNodes()
    cleanupOldPriceCache()
  }, [])
  
  return (
    <MarketDataProvider>
      <SelectedTokensProvider>
        <AppLayout />
      </SelectedTokensProvider>
    </MarketDataProvider>
  )
}

// ❌ MAUVAIS : Logique métier dans App.jsx
```

### Séparation des Responsabilités

| Type de Logique | Emplacement | Exemple |
|----------------|-------------|---------|
| **Providers (Context global)** | `src/providers/` ⚠️ TODO | `MarketDataProvider.jsx`, `BinanceProvider.jsx`, `SelectedTokensProvider.jsx` |
| **Context (À migrer)** | `src/context/` | `MarketDataContext.jsx`, `SelectedTokensContext.jsx`, `NavigationContext.jsx` |
| **Hooks (Logique locale)** | `src/hooks/` | `useToken.js`, `useDraggable.js`, `useResizablePanel.js` |
| Métier / API | `src/lib/` | `priceCalculations.js`, `binanceClient.js` |
| Configuration | `src/config/` | `tokenList.js`, `binanceConfig.js` |
| Composants UI | `src/elements/` | `TokenTile.jsx` |
| Layouts globaux | `src/components/` | `Topbar.jsx`, `Sidebar.jsx` |
| Pages routing | `src/pages/` | `page1.jsx`, `page2.jsx`, `page4.jsx` |

**Note** : Migration `/context` → `/providers` planifiée mais non effectuée pour éviter régressions.

### 🔄 Convention Providers vs Hooks

**Providers (`src/providers/`)** :
- État **global** partagé dans toute l'application
- Wrappent l'arborescence React dans `App.jsx`
- Contiennent Context + Provider + logique de state management
- Exemples : Polling API, authentification, navigation globale

**Hooks (`src/hooks/`)** :
- Logique **réutilisable locale** pour composants individuels
- Appelés directement dans les composants
- Retournent données/fonctions sans créer de Context
- Exemples : Lecture données depuis Context, logique UI, side effects locaux

```jsx
// ✅ BON : Provider pour état global
// src/providers/MarketDataProvider.jsx
export function MarketDataProvider({ children }) {
  const [tokens, setTokens] = useState({})
  // Polling API global...
  return <MarketDataContext.Provider value={{ tokens }}>{children}</MarketDataContext.Provider>
}

// ✅ BON : Hook pour consommer le provider
// src/hooks/useToken.js
export function useToken(symbol) {
  const { tokens } = useContext(MarketDataContext)
  return tokens[symbol]
}

// ❌ MAUVAIS : Hook qui fait du polling global
// src/hooks/useBinancePrices.js (doit être un Provider)
export function useBinancePrices() {
  useEffect(() => { setInterval(...) }, []) // ❌ Side effect global
}
```

### Convention Routing (URLs)
- **PascalCase obligatoire** : `/MarmitonCommunautaire`, `/MaCuisine`, `/BinanceToken`
- **Descriptif et explicite** : Pas de `/page1`, `/page2` (générique)
- **Synchronisé avec labels Sidebar** : URL = même wording que menu
- **Documentation** : Voir `docs/ROUTING.md` pour détails complets

---

## 🔥 Firebase - ARCHITECTURE DUAL-SOURCE

### Structure Base de Données
```
/priceTokenHyper/{coin}/     ← Hyperliquid (BTC, ETH, SOL, BNB*, etc.)
/priceTokenBinance/{coin}/   ← Binance (BNB uniquement pour l'instant)
/users/{uid}/selectedTokens  ← Tokens sélectionnés par utilisateur
```

**BNB = SEUL token dans les DEUX sources**

### Import Paths depuis lib/database/
```javascript
// ❌ ERREUR
import { db } from '../config/firebase'

// ✅ CORRECT
import { db } from '../../config/firebase'
```

### Services Firebase
```javascript
// Hyperliquid → priceTokenHyper
setCachedPriceHyper(coin, { price, prevDayPx, deltaAbs, deltaPct })

// Binance → priceTokenBinance  
setCachedPriceBinance(coin, { price, prevDayPx, deltaAbs, deltaPct })
```

---

## ⚠️ ANTI-PATTERNS CRITIQUES

### NOWNodes/BSC = ON-CHAIN ONLY
```
❌ NE JAMAIS utiliser NOWNodes pour prix de marché
✅ NOWNodes = balances on-chain, smart contracts, transactions
✅ Prix de marché = Binance Spot API ou Hyperliquid API

Historique : Tentative NOWNodes pour prix → supprimée complètement
```

### Pas de Clés API Côté Client
```javascript
// ❌ INTERDIT
const BINANCE_KEY = 'abc123'

// ✅ CORRECT (.env.local)
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY
}
```

---

## 🧩 Patterns de Code

### Hooks pour Logique Réutilisable
```jsx
// ✅ Logique dans hook
export function useToken(symbol) {
  const { getToken } = useMarketData()
  return getToken(symbol)
}

// ✅ Composant utilise le hook
function TokenTile({ symbol }) {
  const { price, deltaPct } = useToken(symbol)
  return <div>{price} ({deltaPct}%)</div>
}
```

### Calculs dans lib/, Pas Composants
```javascript
// ✅ lib/priceCalculations.js
export function calculatePriceChange(current, previous) {
  const deltaAbs = current - previous
  const deltaPct = (deltaAbs / previous) * 100
  return { deltaAbs, deltaPct }
}
```

---

## 📚 MCP Servers

### Disponibles
- **Figma** : Charte graphique, extraction composants
- **Stripe** : Paiements (future feature)
- **GitBook** : Docs Hyperliquid (https://hyperliquid.gitbook.io/hyperliquid-docs/~gitbook/mcp)

### Workflow
1. Vérifier serveur MCP démarré
2. Consulter docs via MCP
3. Adapter code à l'architecture du projet

---

## ✅ Checklist Code

- [ ] App.jsx minimal (< 50 lignes)
- [ ] **Providers** → `src/providers/` (état global, polling API)
- [ ] **Hooks** → `src/hooks/` (logique locale, lecture Context)
- [ ] Logique métier → `src/lib/`
- [ ] Import paths corrects (`../../config/firebase` depuis lib/)
- [ ] `setCachedPriceHyper` pour Hyperliquid
- [ ] `setCachedPriceBinance` pour Binance
- [ ] NOWNodes JAMAIS pour prix
- [ ] Pas clés API en dur
- [ ] Variables d'environnement (.env.local)
- [ ] **AUCUNE régression** après modification (tester avant commit)
- [ ] **Code propre** : supprimer fichiers `_BACKUP`, `_OLD`, `_STEP1`

---

## 🐛 Erreurs Fréquentes

### Import Path Error
```
❌ Cannot find '../config/firebase' from lib/database/
✅ Utiliser '../../config/firebase'
```

### Firebase Permission Denied
```
✅ Vérifier database.rules.json
✅ Déployer via Firebase Console
✅ Initialiser nœuds (initializePriceNodes)
```

### Token Price = null
```
✅ Vérifier symbole dans getHyperliquidTokenSymbols()
✅ Vérifier source: 'hyperliquid' dans tokenList.js
✅ Ne JAMAIS envoyer tokens BSC à Hyperliquid API
```

---

## 🛡️ Règles de Modification du Code

### Avant TOUTE modification :
1. **Lire le code existant** pour comprendre le contexte
2. **Identifier les dépendances** (imports, exports, usages)
3. **Prévoir les impacts** sur les autres fichiers
4. **Tester mentalement** les cas limites

### Pendant la modification :
1. **Une seule responsabilité par commit**
2. **Garder le code fonctionnel** à chaque étape
3. **Mettre à jour TOUS les imports** concernés
4. **Supprimer les fichiers obsolètes** (backups, old versions)

### Après la modification :
1. **Vérifier aucune régression** (tester les fonctionnalités impactées)
2. **Nettoyer les console.log** et code commenté
3. **Mettre à jour la documentation** si architecture modifiée
4. **Commit avec message descriptif**

### ⛔ Interdictions absolues :
- ❌ Laisser du code cassé "pour plus tard"
- ❌ Créer des fichiers `_BACKUP` ou `_OLD` (utiliser Git)
- ❌ Modifier sans tester
- ❌ Casser une feature pour en ajouter une autre
- ❌ Ignorer les erreurs TypeScript/ESLint

---

**Avant de coder, confirmer compréhension :**
1. Architecture dual-source (Hyperliquid + Binance)
2. Anti-patterns (NOWNodes pour prix, clés API client)
3. Patterns (hooks UI, lib métier, import paths)
4. **Convention Providers vs Hooks** (global vs local)
