# Sauvegarde des Poids du Portfolio

## Architecture

Les poids personnalisés du portfolio sont automatiquement sauvegardés dans Firebase Realtime Database.

### Structure Firebase

```
/users/{uid}/
  ├── selectedTokens: ["BTC:hyperliquid", "SOL:hyperliquid"]
  └── portfolioWeights: { "BTC": 0.6, "SOL": 0.4 }
```

---

## Fonctionnement

### 1. Chargement Initial

Au montage de la page **Ma Cuisine**, `usePortfolioSimulation` charge les poids sauvegardés :

```javascript
const savedWeights = await getPortfolioWeights(user.uid)
// → { BTC: 0.6, SOL: 0.4 }

// Vérification que les tokens correspondent
if (sameTokens) {
  setWeights(savedWeights) // Restaure la config utilisateur
} else {
  setWeights(initialWeights) // Reset équitable si tokens changés
}
```

**Cas d'usage** :
- User ajuste BTC à 60%, SOL à 40%
- Ferme l'onglet
- Revient plus tard → Poids restaurés à 60/40 ✅

---

### 2. Sauvegarde Automatique (Debounced)

Quand l'utilisateur ajuste un slider, la sauvegarde est **différée de 500ms** pour éviter trop d'écritures pendant l'ajustement :

```javascript
const setWeight = (token, newWeight) => {
  const newWeights = redistributeWeights(weights, token, newWeight)
  setWeights(newWeights)
  
  // Debounce : annule le timer précédent
  clearTimeout(saveTimerRef.current)
  
  // Sauvegarde après 500ms d'inactivité
  saveTimerRef.current = setTimeout(async () => {
    await savePortfolioWeights(user.uid, newWeights)
  }, 500)
}
```

**Optimisation** :
- User bouge slider BTC de 50% → 60% en 2 secondes
- Firebase écrit **1 seule fois** après 500ms d'inactivité
- Évite 20+ écritures inutiles

---

### 3. Réinitialisation

Bouton **Réinitialiser** :
- Annule le debounce en cours
- Sauvegarde **immédiatement** les poids équitables
- Pas de délai car action volontaire

```javascript
const resetWeights = async () => {
  clearTimeout(saveTimerRef.current)
  setWeights(initialWeights)
  await savePortfolioWeights(user.uid, initialWeights)
}
```

---

### 4. Changement de Tokens

Quand l'utilisateur ajoute/supprime un token dans **Ma Cuisine** :

```javascript
// Suppression d'un token
const removeToken = async (symbolWithSource) => {
  const newTokens = userTokens.filter(s => s !== symbolWithSource)
  setUserTokens(newTokens)
  
  // Nettoyer portfolioWeights
  const removedSymbol = symbolWithSource.split(':')[0]
  const updatedWeights = { ...currentWeights }
  delete updatedWeights[removedSymbol]
  
  await savePortfolioWeights(user.uid, updatedWeights)
}

// Ajout d'un token → useEffect détecte le changement
useEffect(() => {
  const currentSymbols = Object.keys(weights).sort().join(',')
  const newSymbols = tokensData.map(t => t.symbol).sort().join(',')
  
  if (currentSymbols !== newSymbols) {
    setWeights(initialWeights) // Reset équitable
  }
}, [tokensData])
```

**Exemple** :
1. Config sauvegardée : `{ BTC: 0.6, SOL: 0.4 }`
2. User supprime SOL → `portfolioWeights` mis à jour : `{ BTC: 1.0 }`
3. User ajoute AVAX → Reset à `{ BTC: 0.5, AVAX: 0.5 }`
4. Ajuste manuellement → Nouvelle config sauvegardée

---

## Services Firebase

### `savePortfolioWeights(uid, weights)`

Sauvegarde les poids dans Firebase.

```javascript
await savePortfolioWeights('user123', { BTC: 0.6, ETH: 0.4 })
// Firebase: /users/user123/portfolioWeights → { BTC: 0.6, ETH: 0.4 }
```

### `getPortfolioWeights(uid)`

Récupère les poids sauvegardés.

```javascript
const weights = await getPortfolioWeights('user123')
// → { BTC: 0.6, ETH: 0.4 } ou null si non défini
```

---

## Workflow Complet

```
1. User ouvre "Ma Cuisine"
   ├─> Charge selectedTokens depuis Firebase
   ├─> Charge portfolioWeights depuis Firebase
   └─> Si même tokens → Restaure poids, sinon → Reset équitable

2. User ajuste slider BTC
   ├─> redistributeWeights() calcule nouveaux poids
   ├─> setWeights() met à jour UI immédiatement
   └─> Debounce 500ms → savePortfolioWeights()

3. User supprime SOL
   ├─> selectedTokens mis à jour dans Firebase
   ├─> portfolioWeights nettoyé : { BTC: 1.0 }
   ├─> tokensData recalculé
   └─> UI mise à jour avec BTC à 100%

4. User clique "Réinitialiser"
   ├─> Annule debounce
   ├─> setWeights(initialWeights)
   └─> savePortfolioWeights() immédiatement
```

---

## Règles de Sécurité Firebase

```json
{
  "rules": {
    "users": {
      "$uid": {
        "portfolioWeights": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        }
      }
    }
  }
}
```

Seul le propriétaire peut lire/écrire ses poids.

---

## Cas Limites Gérés

### ❌ User non connecté
```javascript
if (!user?.uid) {
  // Pas de sauvegarde, poids en mémoire uniquement
  // Reset à chaque rechargement
}
```

### ❌ Tokens changés entre sessions
```javascript
// Sauvegardé : { BTC: 0.6, SOL: 0.4 }
// Actuels : { BTC, AVAX }
if (currentSymbols !== savedSymbols) {
  setWeights(initialWeights) // Reset équitable
}
```

### ❌ Erreur Firebase
```javascript
try {
  await savePortfolioWeights(uid, weights)
} catch (error) {
  console.error('❌ Sauvegarde échouée:', error)
  // L'app continue de fonctionner, poids en mémoire
}
```

---

## Performance

**Écritures Firebase** :
- Sans debounce : ~20 écritures par ajustement slider
- Avec debounce 500ms : **1 seule écriture** ✅

**Lectures Firebase** :
- 1 lecture au montage de la page
- 0 lecture pendant utilisation (cache en mémoire)

**Quota Firebase Spark** :
- 100k lectures/jour
- 20k écritures/jour
- Largement suffisant même avec 1000 users actifs
