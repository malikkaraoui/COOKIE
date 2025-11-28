# 🍪 COOKIE - Instructions GitHub Copilot

**Application React** de trading crypto multi-sources avec Firebase.

---

## 📋 Architecture Projet

### Stack Technique
- **Frontend** : React 19 + Vite + TailwindCSS
- **APIs** : Hyperliquid (10 tokens) + Binance Spot (BNB + BEP-20)
- **Backend** : Firebase Realtime Database + Firebase Auth
- **État** : Context API (providers)

### Sources de Données

| Source | Usage | Tokens |
|--------|-------|--------|
| **Hyperliquid API** | Prix crypto temps réel | BTC, ETH, SOL, BNB, MATIC, kPEPE, AVAX, ATOM, APT, ARB |
| **Binance Spot API** | Prix BNB + tokens BEP-20 | BNB, CAKE, DOGE, SHIB, etc. |
| **Firebase RTDB** | Cache prix + auth users | Tous |

⚠️ **NOWNodes/BSC** : Uniquement balances on-chain, JAMAIS pour prix de marché.  
ℹ️ **Statut actuel** : NOWNodes n’est pas utilisé pour l’instant dans COOKIE.

---

## 🎯 Règles d'Architecture STRICTES

### 1. Structure Dossiers

```
src/
├── providers/          # Context providers (état global, polling API)
├── context/            # Legacy contexts (à migrer vers providers/)
├── hooks/              # Hooks réutilisables (logique locale)
├── lib/                # Logique métier + services API
│   ├── database/       # Firebase services
│   └── binance/        # Binance client
├── config/             # Configuration (tokens, API keys)
├── components/         # Layouts globaux (Sidebar, Topbar)
├── elements/           # Composants UI réutilisables
└── pages/              # Pages routing
```

### 2. Convention Providers vs Hooks

**Providers** (`src/providers/`) :
- État **global** partagé dans toute l'app
- Wrappent `<App>` dans `main.jsx`
- Contiennent Context + Provider + state management
- Exemples : Polling API, authentification, navigation

**Hooks** (`src/hooks/`) :
- Logique **locale** pour composants individuels
- Appelés directement dans composants
- Retournent données/fonctions (pas de Context)
- Exemples : Lecture Context, logique UI, side effects locaux

```jsx
// ✅ BON : Provider pour état global
export function MarketDataProvider({ children }) {
  const [tokens, setTokens] = useState({})
  // Polling global...
  return <MarketDataContext.Provider value={{ tokens }}>{children}</MarketDataContext.Provider>
}

// ✅ BON : Hook pour consommer
export function useToken(symbol) {
  const { tokens } = useContext(MarketDataContext)
  return tokens[symbol]
}

// ❌ MAUVAIS : Hook avec polling global
export function usePrices() {
  useEffect(() => { setInterval(...) }, []) // Side effect global
}
```

### 3. App.jsx = MINIMAL (< 50 lignes)

```jsx
// ✅ Uniquement composition + init
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
```

---

## 🔥 Firebase - Architecture Dual-Source

### Structure Realtime Database

```
/priceTokenHyper/{coin}/     ← Hyperliquid (BTC, ETH, SOL...)
  price: number
  prevDayPx: number
  deltaAbs: number
  deltaPct: number

/priceTokenBinance/{coin}/   ← Binance (BNB uniquement)
  price: number
  prevDayPx: number
  deltaAbs: number
  deltaPct: number

/users/{uid}/selectedTokens  ← Tokens sélectionnés par user
```

**BNB = SEUL token dans les DEUX sources.**

### Services Firebase

```javascript
// lib/database/priceCache.js

// Hyperliquid → priceTokenHyper
setCachedPriceHyper(coin, { price, prevDayPx, deltaAbs, deltaPct })

// Binance → priceTokenBinance  
setCachedPriceBinance(coin, { price, prevDayPx, deltaAbs, deltaPct })
```

### Import Paths

```javascript
// ❌ ERREUR
import { db } from '../config/firebase'

// ✅ CORRECT (depuis lib/database/)
import { db } from '../../config/firebase'
```

---

## 🌐 APIs - Règles d'Utilisation

### Binance Spot API (Prix de Marché)

**Base URL** : `https://api.binance.com`

**Endpoints** :
```javascript
// Prix actuel
GET /api/v3/ticker/price?symbol=BNBUSDT

// Prix + variation 24h
GET /api/v3/ticker/24hr?symbol=BNBUSDT
```

**Client** : `src/lib/binance/binanceClient.js`

### Hyperliquid API

**Base URL** : `https://api.hyperliquid.xyz/info`

**Méthode** : POST avec body JSON

```javascript
// OrderBook L2
{ "type": "l2Book", "coin": "BTC" }

// Stats 24h
{ "type": "metaAndAssetCtxs" }
```

**Client** : `src/lib/hlEndpoints.js`

### NOWNodes/BSC (⚠️ ON-CHAIN UNIQUEMENT)

**Base URL** : `https://bsc.nownodes.io`

**Usage STRICT** :
- ✅ Balances on-chain (`eth_getBalance`)
- ✅ Transactions (`eth_getTransactionByHash`)
- ✅ Token balances (via smart contracts)
- ❌ **JAMAIS** pour prix de marché

### 💳 Stripe Checkout & Webhooks

**Références rapides** : `docs/instructions/stripe-checkout.md`, `.github/instructionStripeWebhooks.md`, `.github/deployStripeWebhookFunction.md`, `.github/README-stripe-firebase-links.md`.

#### Callable `createCheckoutSession`
- Fonction **Firebase Functions v2** `onCall` (CommonJS) définie dans `functions/index.js`.
- Toujours instancier Stripe avec `const stripe = new Stripe(stripeSecret.value(), { apiVersion: "2024-06-20" })`.
- Secrets via `defineSecret("STRIPE_SECRET_KEY")` (jamais `functions.config()` ni clé en clair dans le front).
- Réponse attendue : `{ url: session.url }` et redirection gérée côté front via `httpsCallable(functions, "createCheckoutSession")` (`src/lib/stripeCheckout.js`).
- Côté front, ne jamais remplacer l’appel callable par `fetch` vers l’URL publique de la fonction.

#### Webhook `handleStripeWebhook`
- Fonction **`onRequest`** v2 dédiée, branchée depuis `functions/index.js` vers `functions/stripeWebhooks.js`.
- Secrets obligatoires : `STRIPE_SECRET_KEY` **et** `STRIPE_WEBHOOK_SECRET` (déclarés via `defineSecret`).
- Vérification cryptographique **impérative** :
  ```js
  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    req.headers['stripe-signature'],
    stripeWebhookSecret.value()
  )
  ```
  > Ne jamais parser le body avant cette étape, ne pas supprimer la vérification de signature.
- Refuser toute méthode ≠ POST (HTTP 405) et tout header `Stripe-Signature` manquant (HTTP 400).
- Journaliser uniquement `event.type`, `event.id`, `session.id`, `uid` (pas de secrets dans les logs).

#### Contrat Realtime Database
- Chaque session Stripe doit contenir `metadata.uid` pour rattacher le paiement à un utilisateur Firebase.
- Succès (`checkout.session.completed`, `checkout.session.async_payment_succeeded`) → mettre à jour `users/{uid}/membership` avec `{ active: true, status: "active", tier: "premium", since: ServerValue.TIMESTAMP }` et créer/mettre à jour `users/{uid}/products/COOKIE_PREMIUM`.
- Échec / expiré (`checkout.session.async_payment_failed`, `checkout.session.expired`, `payment_intent.payment_failed`) → `membership.active = false`, `membership.status = "failed"`, conserver `lastErrorEvent`.
- Ne jamais modifier `createCheckoutSession` pour gérer ces statuts : toute source de vérité passe par le webhook.

#### Déploiement & tests
- Secrets :
  ```bash
  firebase functions:secrets:set STRIPE_SECRET_KEY
  firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
  ```
- Déploiement ciblé : `firebase deploy --only functions:createCheckoutSession,functions:handleStripeWebhook`.
- Tests : Stripe CLI (`stripe listen --forward-to .../handleStripeWebhook`, `stripe trigger checkout.session.completed`).

---

## 🔐 Environnements Multi-Branches

### Structure

| Environnement | Branche | Fichier `.env` | Hyperliquid | Argent |
|---------------|---------|----------------|-------------|--------|
| Development | `dev` | `config/credentials/.env.development` | Testnet | Faux 🧪 |
| Staging | `release` | `config/credentials/.env.staging` | Testnet | Faux 🧪 |
| Production | `main` | `config/credentials/.env.production` | Mainnet | Vrai ⚠️ |

### Variables d'Environnement

```bash
# Firebase (partagé)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_DATABASE_URL=

# Hyperliquid (différent par env)
VITE_HYPERLIQUID_API_URL=        # testnet vs mainnet
VITE_HYPERLIQUID_API_KEY=
VITE_HYPERLIQUID_API_SECRET=

# Binance (partagé)
VITE_BINANCE_API_URL=https://api.binance.com

# Debug
VITE_ENABLE_DEBUG_LOGS=          # true dev, false prod
VITE_ENVIRONMENT=                # development|staging|production
```

### Sécurité

**JAMAIS commit** :
- ❌ `config/credentials/.env.development`, `config/credentials/.env.staging`, `config/credentials/.env.production`
- ❌ Clés API en clair dans code
- ❌ Credentials dans fichiers `.example`

**TOUJOURS** :
- ✅ Utiliser `import.meta.env.VITE_*`
- ✅ Clés dans `.env.*` (gitignorés)
- ✅ Placeholders dans `.env.example`

---

## 🛠️ Patterns de Code

### Hooks UI Réutilisables

```jsx
// src/hooks/useToken.js
export function useToken(symbol) {
  const { getToken } = useMarketData()
  return getToken(symbol)
}

// Utilisation dans composant
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

### Convention Routing (URLs)

- **PascalCase obligatoire** : `/MarmitonCommunautaire`, `/MaCuisine`
- **Descriptif** : Pas de `/page1`, `/page2`
- **Synchronisé avec Sidebar** : URL = même label que menu

---

## ⚠️ ANTI-PATTERNS CRITIQUES

### NOWNodes pour Prix = INTERDIT

```
❌ NE JAMAIS utiliser NOWNodes pour prix de marché
✅ NOWNodes = balances on-chain, smart contracts, transactions
✅ Prix de marché = Binance Spot API ou Hyperliquid API
```

### Pas de Clés API Côté Client

```javascript
// ❌ INTERDIT
const BINANCE_KEY = 'abc123'

// ✅ CORRECT
const apiKey = import.meta.env.VITE_BINANCE_API_KEY
```

### App.jsx Minimal

```jsx
// ❌ MAUVAIS
export default function App() {
  const [tokens, setTokens] = useState({})
  useEffect(() => { /* Polling API */ }, [])
  // Logique métier...
}

// ✅ BON
export default function App() {
  return <MarketDataProvider><AppLayout /></MarketDataProvider>
}
```

---

## 📝 Git Workflow - Conventional Commits

### Extension VS Code

**Installer** : `Conventional Commits` extension  
**Commande** : `Ctrl+Shift+P` → `Conventional Commits`

### Types

| Type | Usage | Emoji |
|------|-------|-------|
| `feat` | Nouvelle fonctionnalité | ✨ |
| `fix` | Correction bug | 🐛 |
| `docs` | Documentation seule | 📝 |
| `style` | CSS, formatage | 💄 |
| `refactor` | Refactoring | ♻️ |
| `perf` | Performance | ⚡ |
| `chore` | Maintenance, deps | 🔧 |
| `ci` | CI/CD | 👷 |

### Scopes COOKIE

`hooks`, `providers`, `context`, `components`, `elements`, `pages`, `auth`, `firebase`, `api`, `config`, `docs`

### Exemples

```bash
feat(hooks): add useHover for button interactions
fix(firebase): correct databaseURL environment variable
docs(api): add Binance API usage guidelines
chore(deps): update firebase to v12.6.0
```

---

## 🔍 Checklist Développement

**Avant toute modification** :
- [ ] Lire code existant (contexte)
- [ ] Identifier dépendances (imports, exports)
- [ ] Prévoir impacts (autres fichiers)
- [ ] Tester mentalement cas limites

**Pendant modification** :
- [ ] Une responsabilité par commit
- [ ] Code fonctionnel à chaque étape
- [ ] Mettre à jour tous imports
- [ ] Supprimer fichiers obsolètes (pas de `_BACKUP`)

**Après modification** :
- [ ] Vérifier aucune régression
- [ ] Nettoyer console.log
- [ ] Mettre à jour docs si archi modifiée
- [ ] Commit avec Conventional Commits

**Interdictions absolues** :
- ❌ Laisser code cassé
- ❌ Créer fichiers `_BACKUP`, `_OLD` (utiliser Git)
- ❌ Modifier sans tester
- ❌ Casser feature pour en ajouter une autre
- ❌ Ignorer erreurs ESLint

---

## 📚 Documentation Complète

- `QUICKSTART.md` - Démarrage rapide (5 min)
- `MIGRATION.md` - Migration ancien système
- `docs/ENVIRONMENTS.md` - Environnements multi-branches
- `docs/CACHE_ARCHITECTURE.md` - Système de cache Firebase
- `docs/PRICE_CALCULATIONS.md` - Logique métier calculs
- `.github/SECRETS_SETUP.md` - Configuration GitHub Secrets

---

**Dernière mise à jour** : 24 novembre 2025  
**Version** : 2.0.0
