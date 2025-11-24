# 📁 Dossier .github - COOKIE

Ce dossier contient la configuration Git et GitHub du projet.

## 📂 Structure

```
.github/
├── copilot-instructions.md     ← Instructions pour GitHub Copilot
├── SECRETS_SETUP.md            ← 🔐 Guide configuration GitHub Secrets
├── README.md                   ← Ce fichier
└── workflows/
    └── deploy.yml.example      ← Template GitHub Actions CI/CD
```

---

## 🔐 SECRETS_SETUP.md

**Guide complet** pour configurer les GitHub Secrets nécessaires au déploiement automatique.

**Contenu** :
- Liste des 16 secrets à créer
- Où obtenir chaque clé API
- Configuration Firebase Service Accounts
- Sécurité et bonnes pratiques
- Troubleshooting

**Quand utiliser** :
- Setup initial CI/CD
- Ajout nouvelle branche (dev/release/main)
- Rotation clés API
- Debugging déploiement

**Lire maintenant** : [SECRETS_SETUP.md](./SECRETS_SETUP.md)

---

## 🚀 workflows/deploy.yml.example

**Template** pour GitHub Actions déploiement multi-environnements.

**Fonctionnalités** :
- Déploiement automatique par branche (dev/release/main)
- Création fichiers `.env.*` depuis GitHub Secrets
- Build et déploiement Firebase Hosting
- Environnements séparés (development/staging/production)

**Configuration** :
```bash
# Copier le template
cp .github/workflows/deploy.yml.example .github/workflows/deploy.yml

# Adapter à votre plateforme (Firebase/Vercel/Netlify)
code .github/workflows/deploy.yml

# Commit et push
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions deployment workflow"
git push origin main
```

**Plateformes supportées** :
- Firebase Hosting (exemple par défaut)
- Vercel (adapter `deploy` step)
- Netlify (adapter `deploy` step)
- AWS Amplify (adapter `deploy` step)

---

## 📝 copilot-instructions.md

**Instructions** pour GitHub Copilot spécifiques au projet COOKIE.

**Contenu** :
- Architecture dual-source (Hyperliquid + Binance)
- Règles d'architecture strictes
- Convention Providers vs Hooks
- Patterns de code
- Anti-patterns critiques

**Usage** :
- Utilisé automatiquement par GitHub Copilot dans VS Code
- Améliore suggestions contextuelles
- Respecte architecture du projet

---

## 🔄 Workflow Déploiement

### Branches et Environnements

| Branche | Environnement | API Hyperliquid | Argent | URL Déployée |
|---------|---------------|-----------------|--------|--------------|
| `dev` | Development | Testnet | Faux 🧪 | dev.cookie.app |
| `release` | Staging | Testnet | Faux 🧪 | staging.cookie.app |
| `main` | Production | Mainnet | Vrai ⚠️ | cookie.app |

### Déclenchement Automatique

```bash
# Push sur branche dev → Déploie dev.cookie.app
git push origin dev

# Push sur branche release → Déploie staging.cookie.app
git push origin release

# Push sur branche main → Déploie cookie.app (PRODUCTION)
git push origin main
```

### Variables Chargées

Chaque branche charge ses propres secrets depuis GitHub :

**Dev** :
- `VITE_HYPERLIQUID_TESTNET_API_KEY`
- `VITE_HYPERLIQUID_TESTNET_API_SECRET`

**Staging** :
- `VITE_HYPERLIQUID_STAGING_API_KEY`
- `VITE_HYPERLIQUID_STAGING_API_SECRET`

**Production** :
- `VITE_HYPERLIQUID_PRODUCTION_API_KEY` ⚠️
- `VITE_HYPERLIQUID_PRODUCTION_API_SECRET` ⚠️

---

## ✅ Checklist Setup CI/CD

### 1. Créer Branches

```bash
# Créer dev
git checkout -b dev
git push origin dev

# Créer release
git checkout main
git checkout -b release
git push origin release
```

### 2. Configurer GitHub Secrets

Suivre [SECRETS_SETUP.md](./SECRETS_SETUP.md) pour créer les 16 secrets.

### 3. Créer Workflow

```bash
cp .github/workflows/deploy.yml.example .github/workflows/deploy.yml
# Adapter à votre plateforme
git add .github/workflows/deploy.yml
git commit -m "ci: add deployment workflow"
git push origin main
```

### 4. Activer GitHub Actions

1. Aller sur GitHub → Settings → Actions → General
2. Cocher **"Allow all actions and reusable workflows"**
3. Cliquer **Save**

### 5. Tester Déploiement

```bash
# Push sur dev pour tester
git checkout dev
git commit --allow-empty -m "ci: test deployment"
git push origin dev

# Vérifier sur GitHub → Actions tab
```

---

## 🐛 Troubleshooting

### Workflow ne se déclenche pas

**Cause** : GitHub Actions désactivées

**Solution** :
1. GitHub → Settings → Actions → General
2. Activer **"Allow all actions"**

### Secret non trouvé

**Erreur** : `Error: The secret VITE_HYPERLIQUID_TESTNET_API_KEY was not found`

**Solution** :
1. Vérifier nom exact du secret (sensible à la casse)
2. Vérifier secret créé au niveau **Repository** (pas Environment)
3. Re-créer secret si nécessaire

### Build échoue

**Erreur** : `Module not found` ou similaire

**Solution** :
1. Vérifier `package.json` contient toutes les dépendances
2. Vérifier `npm ci` s'exécute correctement
3. Voir logs GitHub Actions pour détails

### Déploiement Firebase échoue

**Erreur** : `Permission denied` ou `Invalid service account`

**Solution** :
1. Vérifier Service Account JSON valide
2. Vérifier permissions Firebase (Editor/Owner)
3. Régénérer Service Account si nécessaire

---

## 📚 Documentation Complète

- **[SECRETS_SETUP.md](./SECRETS_SETUP.md)** - Configuration GitHub Secrets
- **[workflows/deploy.yml.example](./workflows/deploy.yml.example)** - Template workflow
- **[../docs/ENVIRONMENTS.md](../docs/ENVIRONMENTS.md)** - Environnements multi-branches
- **[../QUICKSTART.md](../QUICKSTART.md)** - Démarrage rapide

---

**Dernière mise à jour** : 24 novembre 2025
