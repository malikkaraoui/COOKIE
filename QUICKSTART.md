# 🚀 Guide de Démarrage Rapide - Environnements

## 📋 Prérequis

1. Compte Firebase configuré
2. Clés API Hyperliquid testnet (pour dev/staging)
3. Clés API Hyperliquid mainnet (pour production uniquement)

---

## ⚡ Configuration en 3 étapes

### 1️⃣ Copier le fichier d'environnement

**Pour développement local** :
```bash
cp .env.development.example config/credentials/.env.development
```

**Pour staging** :
```bash
cp .env.example config/credentials/.env.staging
```

**Pour production** :
```bash
# NE PAS créer .env.production localement
# Utiliser variables d'environnement GitHub Actions
```

### 2️⃣ Obtenir les clés API

#### Hyperliquid Testnet (développement)
1. Aller sur https://testnet.hyperliquid.xyz
2. Se connecter avec MetaMask/wallet
3. Aller dans Account → API Keys
4. Créer une nouvelle clé API
5. Copier `API Key` et `API Secret`

#### Hyperliquid Mainnet (production ⚠️)
1. Aller sur https://app.hyperliquid.xyz
2. **ATTENTION** : Clés mainnet = accès aux vrais fonds
3. Utiliser UNIQUEMENT en CI/CD (GitHub Secrets)
4. Jamais stocker localement

### 3️⃣ Remplir le fichier `config/credentials/.env.development`

Éditer `config/credentials/.env.development` et remplacer :
```bash
VITE_HYPERLIQUID_API_KEY=YOUR_TESTNET_KEY_HERE
VITE_HYPERLIQUID_API_SECRET=YOUR_TESTNET_SECRET_HERE
```

---

## 🏃 Lancer l'application

### Développement (testnet)
```bash
npm run dev
# Charge automatiquement .env.development
# URL: http://localhost:5173
```

### Staging (préproduction)
```bash
npm run dev:staging
# Charge .env.staging
```

### Build production
```bash
npm run build
# Charge .env.production (variables CI/CD)
```

---

## ✅ Vérification

### Tester que les variables sont chargées

Ajouter temporairement dans `src/main.jsx` :
```javascript
console.log('Environment:', import.meta.env.VITE_ENVIRONMENT)
console.log('Hyperliquid URL:', import.meta.env.VITE_HYPERLIQUID_API_URL)
console.log('API Key présente:', !!import.meta.env.VITE_HYPERLIQUID_API_KEY)
```

**Attendu en développement** :
```
Environment: development
Hyperliquid URL: https://api.hyperliquid-testnet.xyz
API Key présente: true
```

---

## 🐛 Problèmes Courants

### Variables undefined

**Cause** : Fichier `.env.development` manquant ou mal nommé

**Solution** :
```bash
# Vérifier le fichier existe
ls -la .env.development

# Recréer depuis template
cp .env.development.example .env.development
```

### API Key invalide

**Cause** : Clés testnet utilisées sur mainnet (ou inverse)

**Solution** : Vérifier cohérence URL + clés :
- Testnet : `api.hyperliquid-testnet.xyz` + clés testnet
- Mainnet : `api.hyperliquid.xyz` + clés mainnet

### Vite ne charge pas le bon fichier

**Cause** : Mode Vite incorrect

**Solution** :
```bash
# Forcer le mode
npm run dev              # → .env.development
npm run dev:staging      # → .env.staging
npm run build            # → .env.production
```

---

## 🔐 Sécurité

### ✅ À FAIRE

- ✅ Utiliser clés **testnet** en développement
- ✅ Stocker clés **mainnet** en GitHub Secrets uniquement
- ✅ Vérifier `.gitignore` inclut tous les `.env.*`
- ✅ Supprimer logs de clés API avant commit

### ❌ NE JAMAIS

- ❌ Commit fichiers `.env.*` (sauf `.env.example`)
- ❌ Utiliser clés mainnet localement
- ❌ Partager clés API par email/Slack
- ❌ Mettre clés API en clair dans code source

---

## 📚 Documentation Complète

Voir `docs/ENVIRONMENTS.md` pour :
- Détails techniques
- Configuration CI/CD GitHub Actions
- Variables disponibles
- Workflow Git multi-branches

---

## 🆘 Support

Problème non résolu ? Vérifier :
1. `docs/ENVIRONMENTS.md` - Documentation complète
2. `.env.example` - Template à jour
3. `package.json` scripts - Commandes disponibles
4. `.gitignore` - Protection fichiers sensibles
