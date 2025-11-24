# 🔄 Migration vers Multi-Environnements

## Ce qui a changé

### Avant (ancien système)
```
.env                  ← Un seul fichier pour tout
```

### Après (nouveau système)
```
.env.example          ← Template versionné (commit Git)
.env.development      ← Dev/testnet (ignoré Git)
.env.staging          ← Release/préproduction (ignoré Git)
.env.production       ← Production/mainnet (ignoré Git, CI/CD only)
```

---

## ✅ Actions à Réaliser

### 1️⃣ Mettre à jour votre environnement local

```bash
# Sauvegarder ancien .env (si nécessaire)
cp .env .env.backup

# Créer nouveau fichier development
cp .env.development.example config/credentials/.env.development

# Éditer config/credentials/.env.development avec VOS clés testnet
code config/credentials/.env.development
```

### 2️⃣ Obtenir clés API Hyperliquid Testnet

1. Aller sur https://testnet.hyperliquid.xyz
2. Connecter wallet MetaMask
3. Aller dans **Account** → **API Keys**
4. Cliquer **Create New API Key**
5. Copier `API Key` et `API Secret`
6. Coller dans `config/credentials/.env.development` :
```bash
VITE_HYPERLIQUID_API_KEY=votre_clé_testnet
VITE_HYPERLIQUID_API_SECRET=votre_secret_testnet
```

### 3️⃣ Tester localement

```bash
# Lancer en mode development
npm run dev

# Vérifier dans console navigateur
# Devrait afficher : Environment: development
# Hyperliquid URL: https://api.hyperliquid-testnet.xyz
```

### 4️⃣ Nettoyer ancien fichier

```bash
# Supprimer ancien .env (optionnel, ignoré Git de toute façon)
rm .env

# OU le garder en backup local
mv .env .env.old.backup
```

---

## 📝 Changements dans le Code

### Variables d'environnement ajoutées

Nouvelles variables disponibles :

```javascript
// URL API selon environnement
import.meta.env.VITE_HYPERLIQUID_API_URL
// → Dev/Staging: https://api.hyperliquid-testnet.xyz
// → Production: https://api.hyperliquid.xyz

// Clés API privées
import.meta.env.VITE_HYPERLIQUID_API_KEY
import.meta.env.VITE_HYPERLIQUID_API_SECRET

// Binance (optionnel)
import.meta.env.VITE_BINANCE_API_URL
import.meta.env.VITE_BINANCE_API_KEY
import.meta.env.VITE_BINANCE_API_SECRET

// Debug
import.meta.env.VITE_ENABLE_DEBUG_LOGS      // true en dev, false en prod
import.meta.env.VITE_ENABLE_CONSOLE_ERRORS  // true en dev, false en prod
import.meta.env.VITE_ENVIRONMENT            // 'development' | 'staging' | 'production'
```

### Exemple d'utilisation conditionnelle

```javascript
// src/lib/hyperliquid/client.js (à créer)
const API_URL = import.meta.env.VITE_HYPERLIQUID_API_URL
const API_KEY = import.meta.env.VITE_HYPERLIQUID_API_KEY

if (import.meta.env.VITE_ENABLE_DEBUG_LOGS) {
  console.log('Hyperliquid API URL:', API_URL)
  console.log('Environment:', import.meta.env.VITE_ENVIRONMENT)
}

// Avertissement si production
if (import.meta.env.VITE_ENVIRONMENT === 'production') {
  console.warn('⚠️ MODE PRODUCTION - VRAI ARGENT ACTIF')
}
```

---

## 🌿 Workflow Git Multi-Branches

### Structure recommandée

```
main       ← Production (mainnet, vrai argent)
  ↑
release    ← Staging (testnet, tests finaux)
  ↑
dev        ← Development (testnet, features)
  ↑
feature/*  ← Branches de développement individuel
```

### Créer les branches

```bash
# Créer branche dev depuis main
git checkout main
git pull origin main
git checkout -b dev
git push origin dev

# Créer branche release depuis main
git checkout main
git checkout -b release
git push origin release
```

### Workflow de développement

**1. Nouvelle feature** :
```bash
git checkout dev
git pull origin dev
git checkout -b feature/nom-feature
# ... développement ...
git commit -m "feat: description"
git push origin feature/nom-feature
# Créer Pull Request vers dev
```

**2. Merge dans dev** :
```bash
# Après approbation PR
git checkout dev
git merge feature/nom-feature
git push origin dev
# → Déploiement auto sur environnement dev
```

**3. Promotion vers staging** :
```bash
# Tester features complètes
git checkout release
git merge dev
git push origin release
# → Déploiement auto sur environnement staging
```

**4. Promotion vers production** :
```bash
# Après tests staging OK
git checkout main
git merge release
git push origin main
# → Déploiement auto sur PRODUCTION (vrai argent ⚠️)
```

---

## 🔧 Modifications `package.json`

### Scripts ajoutés

| Commande | Environnement | Charge |
|----------|---------------|--------|
| `npm run dev` | Development | `.env.development` |
| `npm run dev:staging` | Staging | `.env.staging` |
| `npm run dev:prod` | Production (test local) | `.env.production` |
| `npm run build` | Production | `.env.production` |
| `npm run build:dev` | Development | `.env.development` |
| `npm run build:staging` | Staging | `.env.staging` |

### Différence avec avant

**Avant** :
```json
"dev": "vite"
```

**Maintenant** :
```json
"dev": "vite --mode development"
```

→ Charge explicitement `.env.development`

---

## 🚨 Points d'Attention

### ⚠️ IMPORTANT

1. **Ne jamais** créer `.env.production` localement
   - Les clés mainnet doivent être en GitHub Secrets uniquement
   - Risque d'utiliser vrai argent par erreur

2. **Tester sur testnet** avant production
   - `npm run dev` charge testnet par défaut
   - Vérifier console : `Environment: development`

3. **Supprimer backups** après migration
   - Ne pas laisser traîner `.env.backup`, `.env.old`
   - Utiliser Git pour historique

4. **Vérifier `.gitignore`**
   - Tous les `.env.*` doivent être ignorés
   - Seul `.env.example` est versionné

---

## ✅ Checklist Migration

- [ ] Créer `.env.development` depuis template
- [ ] Obtenir clés testnet Hyperliquid
- [ ] Remplir variables Firebase (copier depuis ancien `.env`)
- [ ] Remplir clés testnet Hyperliquid
- [ ] Tester `npm run dev` fonctionne
- [ ] Vérifier console : `Environment: development`
- [ ] Vérifier URL : `https://api.hyperliquid-testnet.xyz`
- [ ] Supprimer ancien `.env` (ou renommer `.env.backup`)
- [ ] Créer branches `dev` et `release` sur GitHub
- [ ] Configurer GitHub Secrets (voir `.github/SECRETS_SETUP.md`)
- [ ] Tester déploiement automatique sur branche `dev`

---

## 🆘 Problèmes Courants

### Erreur : "VITE_HYPERLIQUID_API_URL is not defined"

**Cause** : Fichier `.env.development` manquant ou mal nommé

**Solution** :
```bash
cp .env.development.example .env.development
code .env.development
```

### Application utilise encore ancien .env

**Cause** : Vite cache ou fichier `.env` existe toujours

**Solution** :
```bash
# Supprimer .env ancien
rm .env

# Nettoyer cache Vite
rm -rf node_modules/.vite

# Relancer
npm run dev
```

### API Key invalide

**Cause** : Clés mainnet utilisées au lieu de testnet

**Solution** : Vérifier cohérence dans `.env.development` :
```bash
VITE_HYPERLIQUID_API_URL=https://api.hyperliquid-testnet.xyz  ← testnet
VITE_HYPERLIQUID_API_KEY=clé_testnet  ← PAS mainnet
```

---

## 📚 Documentation Complète

- `QUICKSTART.md` - Guide rapide de démarrage
- `docs/ENVIRONMENTS.md` - Documentation technique complète
- `.github/SECRETS_SETUP.md` - Configuration GitHub Secrets
- `.github/workflows/deploy.yml.example` - Exemple CI/CD

---

**Migration effectuée le** : 24 novembre 2025
