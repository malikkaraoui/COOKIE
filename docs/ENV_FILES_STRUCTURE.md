# 📂 Structure des Fichiers d'Environnement - COOKIE

## Vue d'ensemble

```
COOKIE/
├── .env.example                    ← Template général (commit Git ✅)
├── .env.development.example        ← Template dev avec vraies valeurs Firebase (commit Git ✅)
├── .env.local.example              ← Template usage local (commit Git ✅)
│
├── .env.development                ← Dev/testnet (ignoré Git ❌)
├── .env.staging                    ← Release/préproduction (ignoré Git ❌)
├── .env.production                 ← Production/mainnet (ignoré Git ❌)
├── .env.local                      ← Override local personnel (ignoré Git ❌)
│
└── .github/
    ├── workflows/
    │   └── deploy.yml.example      ← Template CI/CD (commit Git ✅)
    └── SECRETS_SETUP.md            ← Doc GitHub Secrets (commit Git ✅)
```

---

## 🎯 Fichiers Versionnés (commit Git)

| Fichier | Description | Usage |
|---------|-------------|-------|
| `.env.example` | Template général | Copier pour créer son `.env.*` |
| `.env.development.example` | Template dev avec Firebase réel | Démarrage rapide développement |
| `.env.local.example` | Template override local | Tests personnels non versionnés |
| `.github/workflows/deploy.yml.example` | Template CI/CD | Adapter pour votre déploiement |
| `.github/SECRETS_SETUP.md` | Documentation GitHub Secrets | Guide configuration CI/CD |

### ✅ À Commit

```bash
git add .env.example
git add .env.development.example
git add .env.local.example
git add .github/workflows/deploy.yml.example
git add .github/SECRETS_SETUP.md
git commit -m "docs: add multi-environment templates"
```

---

## 🔒 Fichiers NON Versionnés (ignorés Git)

| Fichier | Environnement | Contient Clés | Usage |
|---------|---------------|---------------|-------|
| `.env.development` | Development | Testnet ✅ | Développement local |
| `.env.staging` | Staging | Testnet ✅ | Préproduction locale |
| `.env.production` | Production | Mainnet ⚠️ | CI/CD uniquement |
| `.env.local` | Local override | Varies | Tests personnels |

### ❌ NE JAMAIS Commit

```bash
# Ces fichiers sont automatiquement ignorés par .gitignore
.env.development
.env.staging
.env.production
.env.local
.env
```

---

## 🌿 Workflow Git Multi-Environnements

### Branches Git

```
main            ← Production (mainnet, vrai argent ⚠️)
  │
  ├── .env.production (CI/CD GitHub Secrets)
  └── Deploy to: https://cookie.app (production)

release         ← Staging (testnet, tests finaux)
  │
  ├── .env.staging (CI/CD GitHub Secrets)
  └── Deploy to: https://staging.cookie.app

dev             ← Development (testnet, features)
  │
  ├── .env.development (CI/CD GitHub Secrets)
  └── Deploy to: https://dev.cookie.app

feature/*       ← Branches de développement
  │
  └── .env.development (local uniquement)
```

### Fichiers d'Environnement par Branche

| Branche | Fichier Local | Fichier CI/CD | API Hyperliquid | Argent |
|---------|---------------|---------------|-----------------|--------|
| `feature/*` | `.env.development` | N/A | Testnet | Faux 🧪 |
| `dev` | `.env.development` | GitHub Secrets | Testnet | Faux 🧪 |
| `release` | `.env.staging` | GitHub Secrets | Testnet | Faux 🧪 |
| `main` | ❌ Jamais local | GitHub Secrets | Mainnet | Vrai ⚠️ |

---

## 📋 Ordres de Priorité Vite

Vite charge les fichiers dans cet ordre (du plus prioritaire au moins) :

### Mode Development (`npm run dev`)

```
1. .env.development.local   ← Ignore (sauf cas très spécifique)
2. .env.local               ← Override personnel (facultatif)
3. .env.development         ← Fichier principal ✅
4. .env                     ← Fallback (non utilisé)
```

### Mode Staging (`npm run dev:staging`)

```
1. .env.staging.local       ← Ignore (sauf cas très spécifique)
2. .env.local               ← Override personnel (facultatif)
3. .env.staging             ← Fichier principal ✅
4. .env                     ← Fallback (non utilisé)
```

### Mode Production (`npm run build`)

```
1. .env.production.local    ← Ignore (sauf cas très spécifique)
2. .env.local               ← Ignore en production
3. .env.production          ← Fichier principal ✅ (CI/CD only)
4. .env                     ← Fallback (non utilisé)
```

---

## 🔧 Cas d'Usage Pratiques

### Cas 1 : Développement Local Standard

```bash
# Créer fichier développement
cp .env.development.example .env.development

# Remplir clés testnet Hyperliquid
code .env.development

# Lancer
npm run dev
```

**Fichiers actifs** :
- ✅ `.env.development` (testnet)
- ❌ Pas de `.env.local` nécessaire

### Variables spécifiques Hyperliquid Functions

Pour piloter l’endpoint utilisé par le bouton d’ordre test :

| Variable | Effet | Exemple |
|----------|-------|---------|
| `VITE_USE_FUNCTIONS_EMULATOR` | Quand `true`, force le front à contacter l’émulateur Firebase local (http://127.0.0.1:5005/…). Valeur par défaut : `false`. | `VITE_USE_FUNCTIONS_EMULATOR=true` |
| `VITE_FUNCTIONS_BASE_URL` | URL complète (sans `/placeTestOrder`) à utiliser si vous voulez cibler une instance spécifique (staging/prod). Prioritaire sur tout le reste. | `VITE_FUNCTIONS_BASE_URL=https://us-central1-cookie1-b3592.cloudfunctions.net` |
| `VITE_FUNCTIONS_PROXY_PATH` | (Optionnel) Préfixe relatif (ex: `/__functions`) pour que Vite/preview proxient les requêtes vers `VITE_FUNCTIONS_BASE_URL`. Utile en dev pour taper directement le cloud sans CORS. Laisse vide pour appeler l’URL publique. | `VITE_FUNCTIONS_PROXY_PATH=/__functions` |

> ⚠️ Si aucune variable n’est définie, le front utilisera directement la fonction déployée (cloud) pour éviter les erreurs quand l’émulateur n’est pas lancé.

---

### Cas 2 : Tests Locaux avec Clés Différentes

```bash
# Garder .env.development avec clés équipe
# Créer override local personnel
cp .env.local.example .env.local

# Remplir VOS clés testnet personnelles
code .env.local

# Lancer (utilise .env.local en priorité)
npm run dev
```

**Fichiers actifs** :
- ✅ `.env.local` (vos clés personnelles)
- ✅ `.env.development` (fallback si variable manquante)

---

### Cas 3 : Tests Staging Locaux

```bash
# Créer fichier staging
cp .env.example .env.staging

# Remplir clés testnet
code .env.staging

# Lancer en mode staging
npm run dev:staging
```

**Fichiers actifs** :
- ✅ `.env.staging` (testnet, préproduction)

---

### Cas 4 : CI/CD GitHub Actions

```yaml
# .github/workflows/deploy.yml
- name: Create .env.production from secrets
  run: |
    echo "VITE_HYPERLIQUID_API_URL=https://api.hyperliquid.xyz" >> .env.production
    echo "VITE_HYPERLIQUID_API_KEY=${{ secrets.VITE_HYPERLIQUID_PRODUCTION_API_KEY }}" >> .env.production
    # ...
```

**Fichiers actifs** :
- ✅ `.env.production` créé dynamiquement depuis GitHub Secrets
- ❌ Jamais créé localement

---

## ⚠️ Erreurs Fréquentes

### Erreur 1 : Variables undefined

**Symptôme** : `import.meta.env.VITE_HYPERLIQUID_API_KEY` est `undefined`

**Causes possibles** :
1. Fichier `.env.development` manquant
2. Variable mal nommée (sans préfixe `VITE_`)
3. Serveur Vite pas redémarré après modification

**Solution** :
```bash
# Vérifier fichier existe
ls -la .env.development

# Vérifier contenu
cat .env.development | grep VITE_HYPERLIQUID_API_KEY

# Redémarrer Vite
npm run dev
```

---

### Erreur 2 : Mauvaises clés chargées

**Symptôme** : Clés production utilisées en développement

**Cause** : Fichier `.env.production` existe localement (ne devrait jamais)

**Solution** :
```bash
# Supprimer .env.production local
rm .env.production

# Vérifier .gitignore
cat .gitignore | grep .env.production

# Relancer
npm run dev
```

---

### Erreur 3 : Git veut commit .env.development

**Symptôme** : `git status` montre `.env.development`

**Cause** : `.gitignore` mal configuré

**Solution** :
```bash
# Vérifier .gitignore contient
cat .gitignore | grep .env

# Devrait afficher :
# .env
# .env.local
# .env.development
# .env.staging
# .env.production
# .env.*.local

# Si manquant, ajouter
echo ".env.development" >> .gitignore
echo ".env.staging" >> .gitignore
echo ".env.production" >> .gitignore

# Retirer du tracking Git si déjà ajouté
git rm --cached .env.development
git commit -m "chore: remove .env.development from Git"
```

---

## 📚 Documentation Complète

- **[QUICKSTART.md](../QUICKSTART.md)** - Guide rapide démarrage
- **[MIGRATION.md](../MIGRATION.md)** - Migration ancien système
- **[docs/ENVIRONMENTS.md](../docs/ENVIRONMENTS.md)** - Doc technique complète
- **[.github/SECRETS_SETUP.md](../.github/SECRETS_SETUP.md)** - Config GitHub Secrets

---

**Dernière mise à jour** : 24 novembre 2025
