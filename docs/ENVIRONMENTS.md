# 🌍 Gestion des Environnements - COOKIE

## Vue d'ensemble

Le projet utilise **3 environnements distincts** synchronisés avec les branches Git :

| Environnement | Branche Git | Fichier `.env` | Hyperliquid | Argent |
|---------------|-------------|----------------|-------------|--------|
| **Development** | `dev` | `.env.development` | Testnet | Faux 🧪 |
| **Staging** | `release` | `.env.staging` | Testnet | Faux 🚀 |
| **Production** | `main` | `.env.production` | Mainnet | Vrai ⚠️ |

---

## 📁 Structure des Fichiers

```
.env.example          ← Template (commit dans Git)
.env.development      ← Dev/testnet (ignoré Git)
.env.staging          ← Release/préproduction (ignoré Git)
.env.production       ← Production/mainnet (ignoré Git)
```

**Tous les fichiers `.env.*` sont ignorés par Git** pour protéger les clés API.

---

## 🛠️ Configuration Locale

### 1. Créer votre fichier d'environnement

**Pour développement (recommandé)** :
```bash
cp .env.example .env.development
```

**Pour staging** :
```bash
cp .env.example .env.staging
```

**Pour production** :
```bash
cp .env.example .env.production
```

### 2. Remplir les clés API

Éditer le fichier créé et remplacer :

#### Firebase (partagé entre tous les environnements)
```bash
VITE_FIREBASE_API_KEY=AIzaSyBr6MXqUHOXUJx9NpgWE9K09mk_NOnPyqs
VITE_FIREBASE_AUTH_DOMAIN=cookie-7c5b6.firebaseapp.com
# ... (valeurs réelles déjà fournies)
```

#### Hyperliquid (selon environnement)

**Development/Staging (testnet)** :
```bash
VITE_HYPERLIQUID_API_URL=https://api.hyperliquid-testnet.xyz
VITE_HYPERLIQUID_API_KEY=your_testnet_key
VITE_HYPERLIQUID_API_SECRET=your_testnet_secret
```

**Production (mainnet) ⚠️** :
```bash
VITE_HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
VITE_HYPERLIQUID_API_KEY=your_mainnet_key
VITE_HYPERLIQUID_API_SECRET=your_mainnet_secret
```

> ⚠️ **ATTENTION** : Les clés mainnet donnent accès à de **vrais fonds** !

---

## 🚀 Utilisation avec Vite

### Mode automatique (selon branche)

Vite détecte automatiquement l'environnement via `--mode` :

```bash
# Development (charge .env.development)
npm run dev
# ou
vite --mode development

# Staging (charge .env.staging)
vite --mode staging

# Production (charge .env.production)
npm run build
# ou
vite build --mode production
```

### Configuration `package.json`

Ajouter dans `scripts` :

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "dev:staging": "vite --mode staging",
    "dev:prod": "vite --mode production",
    "build:dev": "vite build --mode development",
    "build:staging": "vite build --mode staging",
    "build": "vite build --mode production"
  }
}
```

---

## 🔐 Sécurité

### ✅ Bonnes Pratiques

1. **JAMAIS commit** les fichiers `.env.*` (sauf `.env.example`)
2. **Clés testnet** pour dev/staging uniquement
3. **Clés mainnet** stockées en variable d'environnement CI/CD (GitHub Secrets)
4. **Vérifier** `.gitignore` contient tous les `.env.*`

### ❌ À Éviter

- ❌ Clés API en clair dans le code source
- ❌ Utiliser clés mainnet en développement
- ❌ Partager fichiers `.env.*` par email/Slack
- ❌ Commit accidentel de `.env.production`

---

## 🌿 Workflow Git

### Développement (branche `dev`)

```bash
git checkout dev
cp .env.example .env.development
# Éditer .env.development avec clés TESTNET

npm run dev  # Lance avec testnet
```

### Release (branche `release`)

```bash
git checkout release
cp .env.example .env.staging
# Éditer .env.staging avec clés TESTNET

npm run dev:staging  # Tests finaux
```

### Production (branche `main`)

```bash
git checkout main
# NE PAS créer .env.production localement
# Les clés mainnet doivent être en variables d'environnement CI/CD

npm run build  # Build production (utilise variables CI/CD)
```

---

## 🔧 Variables Disponibles

### Firebase (identiques partout)

| Variable | Usage |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | Clé API publique Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domaine OAuth Google |
| `VITE_FIREBASE_PROJECT_ID` | ID projet Firebase |
| `VITE_FIREBASE_DATABASE_URL` | URL Realtime Database |

### Hyperliquid (différent par environnement)

| Variable | Dev/Staging | Production |
|----------|-------------|------------|
| `VITE_HYPERLIQUID_API_URL` | `...testnet.xyz` | `...hyperliquid.xyz` |
| `VITE_HYPERLIQUID_API_KEY` | Clé testnet | Clé mainnet ⚠️ |
| `VITE_HYPERLIQUID_API_SECRET` | Secret testnet | Secret mainnet ⚠️ |

### Binance (optionnel)

| Variable | Usage |
|----------|-------|
| `VITE_BINANCE_API_URL` | URL API Binance |
| `VITE_BINANCE_API_KEY` | Clé API Binance |
| `VITE_BINANCE_API_SECRET` | Secret API Binance |

### Debug

| Variable | Dev/Staging | Production |
|----------|-------------|------------|
| `VITE_ENABLE_DEBUG_LOGS` | `true` | `false` |
| `VITE_ENABLE_CONSOLE_ERRORS` | `true` | `false` |
| `VITE_ENVIRONMENT` | `development`/`staging` | `production` |

---

## 📦 Utilisation dans le Code

```javascript
// Accès aux variables d'environnement
const apiUrl = import.meta.env.VITE_HYPERLIQUID_API_URL
const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production'

// Exemple conditionnel
if (import.meta.env.VITE_ENABLE_DEBUG_LOGS) {
  console.log('Prix BTC:', price)
}
```

---

## 🚨 Troubleshooting

### Variables non définies

```bash
# Vérifier le fichier existe
ls -la .env.development

# Vérifier le mode Vite
vite --mode development
```

### Mauvais environnement chargé

```bash
# Forcer le mode
npm run dev  # Force development
vite build --mode production  # Force production
```

### Clés API invalides

```bash
# Vérifier les URLs selon environnement
# Dev/Staging : https://api.hyperliquid-testnet.xyz
# Production : https://api.hyperliquid.xyz
```

---

## 📚 Ressources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Hyperliquid Testnet](https://testnet.hyperliquid.xyz)
- [Hyperliquid Mainnet](https://app.hyperliquid.xyz)
- [Firebase Console](https://console.firebase.google.com)

---

**Dernière mise à jour** : 24 novembre 2025
