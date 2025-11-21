# Architecture du Cache des Prix - Multi-Tokens

## 🎯 Objectif

Garantir l'**affichage instantané** et la **résilience** des prix pour **tous les tokens** même si Hyperliquid est indisponible.

---

## 📊 Stratégie Hybride : localStorage + Firebase + Live

### 🔄 **Flux de données** :

```
┌─────────────────────────────────────────────────────────┐
│                    1. CHARGEMENT INITIAL                │
│                                                           │
│  ┌──────────────────┐                                    │
│  │ MarketDataContext│──► Lit localStorage                │
│  └──────────────────┘    (marketDataCache_v1)            │
│         │                                                 │
│         ▼                                                 │
│   📦 Affichage IMMÉDIAT de tous les tokens               │
│   (même si vieux de quelques secondes)                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  2. MISE À JOUR LIVE                    │
│                                                           │
│  ┌──────────────────┐                                    │
│  │ MarketDataContext│──► Polling API assetCtxs (5s)      │
│  └──────────────────┘    POST /info {"type":"assetCtxs"} │
│         │                 coins: [BTC, ETH, SOL, ...]    │
│         ▼                                                 │
│   🟢 Récupère markPx + prevDayPx pour TOUS les tokens    │
│         │                                                 │
│         ▼                                                 │
│   📊 Calcul deltaAbs + deltaPct (priceCalculations.js)   │
│         │                                                 │
│         ▼                                                 │
│   💾 Mise à jour localStorage (instantané)               │
│         │                                                 │
│         ▼                                                 │
│   🔥 Écriture Firebase Realtime DB (backup)              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  3. FALLBACK (si erreur)                │
│                                                           │
│  ❌ Hyperliquid timeout / erreur 500                     │
│         │                                                 │
│         ▼                                                 │
│  📦 Utilise localStorage (cache navigateur)              │
│     Status: "cached"                                     │
│     Source: "cache"                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Structure du Cache

### **localStorage** : `marketDataCache_v1`

**Exemple** :
```json
{
  "BTC": {
    "price": 84582,
    "prevDayPx": 91653,
    "deltaAbs": -7071,
    "deltaPct": -7.72,
    "status": "live",
    "source": "live",
    "updatedAt": 1732176000000
  },
  "ETH": {
    "price": 3245.12,
    "prevDayPx": 3180.00,
    "deltaAbs": 65.12,
    "deltaPct": 2.05,
    "status": "live",
    "source": "live",
    "updatedAt": 1732176005000
  },
  "kPEPE": {
    "price": 0.004287,
    "prevDayPx": 0.004514,
    "deltaAbs": -0.000227,
    "deltaPct": -5.03,
    "status": "live",
    "source": "live",
    "updatedAt": 1732176010000
  }
}
```

### **Firebase Realtime Database** : `/priceCache/{coin}`

Structure identique à localStorage (backup + partage multi-device)

---

## ⚙️ Règles de Sécurité Firebase

**Fichier** : `database.rules.json`

```json
{
  "priceCache": {
    "$coin": {
      ".read": true,  // ✅ Lecture publique
      ".write": true  // ✅ Écriture publique (données non sensibles)
    }
  }
}
```

### **Pourquoi écriture publique ?**
- Les prix sont des **données publiques**
- Permet la mise à jour même sans connexion
- Simplifie l'architecture (pas de dépendance auth)

---

## 🚀 Économie d'Échelle : Multi-Tokens

### **Avant** : 1 requête par token
```javascript
// ❌ 10 tokens = 10 requêtes toutes les 5s = surcharge
fetch('/info', { coins: ['BTC'] })  // Requête 1
fetch('/info', { coins: ['ETH'] })  // Requête 2
// ...
```

### **Maintenant** : 1 requête pour tous les tokens
```javascript
// ✅ 10 tokens = 1 seule requête toutes les 5s
fetch('/info', { 
  type: 'assetCtxs', 
  coins: ['BTC', 'ETH', 'SOL', 'BNB', 'MATIC', 'kPEPE', 'AVAX', 'ATOM', 'APT', 'ARB']
})
```

### **Avantages** :
- ⚡ **10x plus rapide** (1 requête HTTP au lieu de 10)
- 💰 **10x moins de bande passante**
- 🎯 **Scalable** : ajouter un token = 0 requête supplémentaire

---

## 🧩 Architecture Modulaire

### **Fichiers clés** :

| Fichier | Rôle |
|---------|------|
| `src/config/tokenList.js` | Configuration centralisée des tokens |
| `src/context/MarketDataContext.jsx` | Polling API + gestion cache multi-tokens |
| `src/hooks/useToken.js` | Hook pour accéder aux données d'un token |
| `src/hooks/useTokenIcon.js` | Gestion centralisée des icônes |
| `src/elements/TokenTile.jsx` | Composant générique réutilisable |
| `src/lib/database/priceCache.js` | Service Firebase (backup)

---

## 📝 Exemple d'Utilisation

### **Méthode moderne (recommandée)** :
```javascript
import TokenTile from '../elements/TokenTile';

function MyComponent() {
  return (
    <div>
      <TokenTile symbol="BTC" />
      <TokenTile symbol="ETH" />
      <TokenTile symbol="kPEPE" />
    </div>
  );
}
```

### **Accès direct aux données** :
```javascript
import { useToken } from '../hooks/useToken';

function MyComponent() {
  const btc = useToken('BTC');
  
  return (
    <div>
      <p>Prix: {btc.price} $</p>
      <p>Variation: {btc.deltaPct}%</p>
      <p>Status: {btc.status}</p>
      <p>Source: {btc.source}</p>
    </div>
  );
}
```

---

## 🎨 Affichage Adaptatif des Prix

### **Logique de décimales selon le prix** :

| Prix | Décimales | Exemple |
|------|-----------|---------|
| < 0,01 $ | **6 décimales** | kPEPE: 0,004287 $ |
| < 1 $ | **4 décimales** | 0,5432 $ |
| < 100 $ | **2 décimales** | ETH: 3 245,12 $ |
| ≥ 100 $ | **0 décimale** | BTC: 84 582 $ |

---

## 🎨 Indicateurs Visuels

| Status | Couleur | Signification |
|--------|---------|---------------|
| `live` | 🟢 Vert | Données en temps réel depuis Hyperliquid |
| `cached` | 🟡 Gris | Données du cache localStorage |
| `loading` | ⏳ Gris | Chargement initial |
| `error` | ❌ Rouge | Erreur critique |

---

## 🔮 Évolutions & Ajout de Tokens

### ✅ **Phase 2 : Multi-tokens** (FAIT)
- 10 tokens supportés
- 1 requête API pour tous
- Composants réutilisables

### **Ajout d'un nouveau token** :

**1. Vérifier disponibilité** :
```bash
node scripts/update-hyperliquid-tokens.js
```

**2. Ajouter dans `src/config/tokenList.js`** :
```javascript
{
  symbol: 'DOGE',
  name: 'Dogecoin',
  color: '#C2A633',
  decimals: 2
}
```

**3. Utiliser** :
```javascript
<TokenTile symbol="DOGE" />
```

✅ **Automatique** : polling, cache, calculs, affichage adaptatif

---

## 📊 Métriques Actuelles

- **Tokens supportés** : 10 actifs
- **Fréquence** : 5 secondes
- **Requêtes API** : 1 pour tous les tokens
- **Chargement** : < 50ms (localStorage)
- **Fallback** : localStorage → Firebase

**Liste** : BTC, ETH, SOL, BNB, MATIC, kPEPE, AVAX, ATOM, APT, ARB
  );
}
```

---

## 🎨 Indicateurs Visuels

| Status | Icône | Couleur | Signification |
|--------|-------|---------|---------------|
| `live` | 🟢 | Vert | Données en temps réel depuis Hyperliquid |
| `cached` | 📦 | Gris | Données du cache (Hyperliquid indisponible) |
| `loading` | ⏳ | Gris | Chargement initial |
| `error` | ❌ | Rouge | Erreur critique |

---

## 🔮 Évolutions Futures

### Phase 2 : Multi-coins
```javascript
// Hook générique
useTokenPrice('ETH'); // ✅
useTokenPrice('SOL'); // ✅
useTokenPrice('BTC'); // ✅
```

### Phase 3 : Historique
```javascript
/priceCache/{coin}/history/{timestamp}
```

### Phase 4 : Analytics
- Temps moyen de réponse Hyperliquid
- Taux d'utilisation du cache
- Alertes si cache utilisé trop souvent
