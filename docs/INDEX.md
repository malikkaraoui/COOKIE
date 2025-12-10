# 📚 Index de la Documentation - COOKIE

## 🚀 Démarrage Rapide

**Vous êtes nouveau sur le projet ?** Suivez cette séquence :

1. **[QUICKSTART.md](../QUICKSTART.md)** ⭐ - 5 min pour démarrer
2. **[README.md](../README.md)** - Vue d'ensemble du projet
3. **[docs/ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Comprendre les environnements

**Vous migrez depuis l'ancien système ?**
- **[MIGRATION.md](../MIGRATION.md)** - Guide de migration complet

---

## 🌍 Environnements & Configuration

| Document | Description | Audience | Durée lecture |
|----------|-------------|----------|---------------|
| **[QUICKSTART.md](../QUICKSTART.md)** | Guide rapide de démarrage | 🟢 Débutants | 5 min |
| **[MIGRATION.md](../MIGRATION.md)** | Migration ancien → nouveau système | 🟡 Utilisateurs existants | 10 min |
| **[ENVIRONMENTS.md](./ENVIRONMENTS.md)** | Documentation technique complète | 🔴 Développeurs avancés | 20 min |
| **[ENV_FILES_STRUCTURE.md](./ENV_FILES_STRUCTURE.md)** | Structure fichiers .env détaillée | 🟡 DevOps | 15 min |
| **[.github/SECRETS_SETUP.md](../.github/SECRETS_SETUP.md)** | Configuration GitHub Secrets CI/CD | 🟡 DevOps | 10 min |

---

## 🧭 Instructions opérationnelles

| Document | Description | Audience | Durée |
|----------|-------------|----------|-------|
| **[docs/instructions/README.md](./instructions/README.md)** | Hub centralisant toutes les consignes (Copilot, Stripe, Binance, etc.) | 🟡 Tous | 5 min |
| **[docs/instructions/stripe-checkout.md](./instructions/stripe-checkout.md)** | Recette complète pour `createCheckoutSession` + pages front | 🔴 Dev Front/Backend | 15 min |
| **[docs/instructions/binance.md](./instructions/binance.md)** | Statut des intégrations Binance / Hyperliquid / NOWNodes | 🟡 Dev Data | 3 min |
| **[.github/instructionStripeWebhooks.md](../.github/instructionStripeWebhooks.md)** | Ajout `handleStripeWebhook`, événements Stripe | 🔴 Backend | 15 min |

---

## 🏗️ Architecture Technique

| Document | Description | Audience | Durée lecture |
|----------|-------------|----------|---------------|
| **[CACHE_ARCHITECTURE.md](./CACHE_ARCHITECTURE.md)** | Système de cache des prix | 🔴 Développeurs | 15 min |
| **[PRICE_CALCULATIONS.md](./PRICE_CALCULATIONS.md)** | Logique métier des calculs | 🔴 Développeurs | 10 min |
| **[REALTIME_DATABASE.md](./REALTIME_DATABASE.md)** | Architecture Firebase RTDB | 🔴 Développeurs | 15 min |
| **[DRAG_DROP_HOOKS.md](./DRAG_DROP_HOOKS.md)** | Système drag & drop tokens | 🔴 Développeurs | 10 min |
| **[HYPERLIQUID_TOKENS.md](./HYPERLIQUID_TOKENS.md)** | Tokens supportés Hyperliquid | 🟡 Tous | 5 min |
| **[ROUTING.md](./ROUTING.md)** | Convention routing URLs | 🟡 Développeurs | 5 min |
| **[UI_COMPONENTS.md](./UI_COMPONENTS.md)** | Design system composants | 🟡 UI/UX | 10 min |

---

## 🔧 Guides Pratiques

### Par Tâche

#### 🆕 Premier Démarrage
1. **[QUICKSTART.md](../QUICKSTART.md)** - Installation et configuration
2. **[docs/ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Comprendre les 3 environnements
3. **[README.md](../README.md)** - Vue d'ensemble du projet

#### 🔄 Migration Ancien Système
1. **[MIGRATION.md](../MIGRATION.md)** - Guide migration
2. **[docs/ENV_FILES_STRUCTURE.md](./ENV_FILES_STRUCTURE.md)** - Structure fichiers

#### 🚀 Déploiement CI/CD
1. **[.github/SECRETS_SETUP.md](../.github/SECRETS_SETUP.md)** - Configuration GitHub Secrets
2. **[.github/workflows/deploy.yml.example](../.github/workflows/deploy.yml.example)** - Template workflow
3. **[docs/ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Section CI/CD

#### 💻 Développement Local
1. **[QUICKSTART.md](../QUICKSTART.md)** - Setup environnement
2. **[docs/CACHE_ARCHITECTURE.md](./CACHE_ARCHITECTURE.md)** - Comprendre le cache
3. **[docs/PRICE_CALCULATIONS.md](./PRICE_CALCULATIONS.md)** - Logique métier

#### 🎨 Contribuer UI/UX
1. **[docs/UI_COMPONENTS.md](./UI_COMPONENTS.md)** - Design system
2. **[docs/DRAG_DROP_HOOKS.md](./DRAG_DROP_HOOKS.md)** - Interactions drag & drop
3. **[docs/ROUTING.md](./ROUTING.md)** - Convention URLs

---

## 🗂️ Par Type de Document

### 📘 Guides Utilisateur (Débutants)

- **[QUICKSTART.md](../QUICKSTART.md)** - Démarrage rapide
- **[README.md](../README.md)** - Vue d'ensemble
- **[MIGRATION.md](../MIGRATION.md)** - Migration

### 📗 Documentation Technique (Développeurs)

- **[docs/ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Environnements multi-branches
- **[docs/CACHE_ARCHITECTURE.md](./CACHE_ARCHITECTURE.md)** - Cache Firebase
- **[docs/PRICE_CALCULATIONS.md](./PRICE_CALCULATIONS.md)** - Calculs prix
- **[docs/REALTIME_DATABASE.md](./REALTIME_DATABASE.md)** - Firebase RTDB
- **[docs/DRAG_DROP_HOOKS.md](./DRAG_DROP_HOOKS.md)** - Drag & drop
- **[docs/ROUTING.md](./ROUTING.md)** - Routing

### 📙 Références Techniques (Avancés)

- **[docs/ENV_FILES_STRUCTURE.md](./ENV_FILES_STRUCTURE.md)** - Structure .env détaillée
- **[docs/HYPERLIQUID_TOKENS.md](./HYPERLIQUID_TOKENS.md)** - Liste tokens
- **[docs/UI_COMPONENTS.md](./UI_COMPONENTS.md)** - Composants UI

### 🔧 DevOps & CI/CD

- **[.github/SECRETS_SETUP.md](../.github/SECRETS_SETUP.md)** - GitHub Secrets
- **[.github/workflows/deploy.yml.example](../.github/workflows/deploy.yml.example)** - Workflow CI/CD

---

<!-- Intégrations & APIs externes (désactivé pour NOWNodes pour le moment) -->

---

## 🎯 Par Persona

### 👨‍💻 Développeur Frontend Junior

**Séquence recommandée** :
1. **[QUICKSTART.md](../QUICKSTART.md)** - Setup environnement
2. **[README.md](../README.md)** - Comprendre l'archi
3. **[docs/UI_COMPONENTS.md](./UI_COMPONENTS.md)** - Design system
4. **[docs/ROUTING.md](./ROUTING.md)** - Convention URLs

### 🧑‍💻 Développeur Backend/API

**Séquence recommandée** :
1. **[QUICKSTART.md](../QUICKSTART.md)** - Setup environnement
2. **[docs/CACHE_ARCHITECTURE.md](./CACHE_ARCHITECTURE.md)** - Comprendre le cache
3. **[docs/PRICE_CALCULATIONS.md](./PRICE_CALCULATIONS.md)** - Logique métier
4. **[docs/REALTIME_DATABASE.md](./REALTIME_DATABASE.md)** - Firebase RTDB

### 👷 DevOps Engineer

**Séquence recommandée** :
1. **[docs/ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Architecture multi-env
2. **[docs/ENV_FILES_STRUCTURE.md](./ENV_FILES_STRUCTURE.md)** - Structure .env
3. **[.github/SECRETS_SETUP.md](../.github/SECRETS_SETUP.md)** - GitHub Secrets
4. **[.github/workflows/deploy.yml.example](../.github/workflows/deploy.yml.example)** - CI/CD

### 🎨 UI/UX Designer

**Séquence recommandée** :
1. **[README.md](../README.md)** - Vue d'ensemble
2. **[docs/UI_COMPONENTS.md](./UI_COMPONENTS.md)** - Design system
3. **[docs/DRAG_DROP_HOOKS.md](./DRAG_DROP_HOOKS.md)** - Interactions

### 📊 Product Manager

**Séquence recommandée** :
1. **[README.md](../README.md)** - Vue d'ensemble fonctionnalités
2. **[docs/HYPERLIQUID_TOKENS.md](./HYPERLIQUID_TOKENS.md)** - Tokens supportés
3. **[docs/ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Workflow déploiement

---

## 🔍 Par Question Fréquente

### "Comment démarrer le projet ?"
→ **[QUICKSTART.md](../QUICKSTART.md)**

### "Comment migrer depuis l'ancien .env ?"
→ **[MIGRATION.md](../MIGRATION.md)**

### "Quelle est la différence entre dev/staging/prod ?"
→ **[docs/ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Section "Vue d'ensemble"

### "Comment configurer GitHub Actions ?"
→ **[.github/SECRETS_SETUP.md](../.github/SECRETS_SETUP.md)**

### "Comment fonctionnent les prix en cache ?"
→ **[docs/CACHE_ARCHITECTURE.md](./CACHE_ARCHITECTURE.md)**

### "Quels tokens sont supportés ?"
→ **[docs/HYPERLIQUID_TOKENS.md](./HYPERLIQUID_TOKENS.md)**

### "Comment ajouter une nouvelle page ?"
→ **[docs/ROUTING.md](./ROUTING.md)**

### "Où sont les composants UI ?"
→ **[docs/UI_COMPONENTS.md](./UI_COMPONENTS.md)**

### "Comment fonctionne le drag & drop ?"
→ **[docs/DRAG_DROP_HOOKS.md](./DRAG_DROP_HOOKS.md)**

### "Variables d'environnement undefined ?"
→ **[docs/ENV_FILES_STRUCTURE.md](./ENV_FILES_STRUCTURE.md)** - Section "Erreurs Fréquentes"

---

## 📝 Templates & Examples

| Fichier | Type | Usage |
|---------|------|-------|
| `.env.example` | Template | Base pour créer .env.* |
| `.env.development.example` | Template | Démarrage rapide dev |
| `.env.local.example` | Template | Override local |
| `.github/workflows/deploy.yml.example` | Workflow CI/CD | GitHub Actions |

---

## 🆕 Nouveautés & Changelog

### Version Actuelle (24 novembre 2025)

**Ajouté** :
- ✅ Système multi-environnements (dev/staging/prod)
- ✅ Templates .env pour chaque environnement
- ✅ Documentation complète environnements
- ✅ Guide migration ancien système
- ✅ Scripts npm pour chaque mode
- ✅ Template GitHub Actions CI/CD

**Documentation créée** :
- `QUICKSTART.md` - Guide rapide
- `MIGRATION.md` - Guide migration
- `docs/ENVIRONMENTS.md` - Doc technique
- `docs/ENV_FILES_STRUCTURE.md` - Structure détaillée
- `.github/SECRETS_SETUP.md` - Config CI/CD
- `docs/INDEX.md` - Ce fichier

---

## 🆘 Besoin d'Aide ?

### Documentation Manquante ?

Créer une issue GitHub avec label `documentation` :
```markdown
**Type de doc** : Guide / Référence / Tutorial
**Sujet** : [Description]
**Audience** : Débutant / Intermédiaire / Avancé
**Cas d'usage** : [Problème à résoudre]
```

### Erreur dans la Doc ?

Créer PR avec correction ou issue avec label `bug-doc`.

### Question Non Couverte ?

1. Chercher dans cet index
2. Lire FAQ dans document concerné
3. Créer issue GitHub avec label `question`

---

## 📚 Ressources Externes

### Firebase
- [Firebase Documentation](https://firebase.google.com/docs)
- [Realtime Database Rules](https://firebase.google.com/docs/database/security)
- [Firebase Auth](https://firebase.google.com/docs/auth)

### Hyperliquid
- [GitBook Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs)
- [Testnet](https://testnet.hyperliquid.xyz)
- [Mainnet](https://app.hyperliquid.xyz)

### Vite
- [Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Configuration Reference](https://vitejs.dev/config/)

### GitHub Actions
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Dernière mise à jour** : 24 novembre 2025  
**Version documentation** : 2.0.0
