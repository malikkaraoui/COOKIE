# 📁 .github - Configuration Projet

Documentation CI/CD et guidelines développement.

---

## 📂 Structure

```
.github/
├── copilot-instructions.md     ← Instructions GitHub Copilot (archi, patterns)
├── SECRETS_SETUP.md            ← Guide configuration GitHub Secrets (CI/CD)
└── workflows/
    └── deploy.yml.example      ← Template GitHub Actions multi-env
```

---

## 📘 Fichiers

### copilot-instructions.md

**Instructions complètes** pour GitHub Copilot :
- Architecture projet (providers, hooks, lib, pages)
- Règles d'utilisation APIs (Hyperliquid, Binance, Firebase)
- Environnements multi-branches (dev/staging/prod)
- Patterns de code + Anti-patterns
- Workflow Git (Conventional Commits)

**Utilisation** : Chargé automatiquement par GitHub Copilot dans VS Code.

---

### SECRETS_SETUP.md

**Guide configuration GitHub Secrets** pour déploiement automatique :
- 16 secrets à créer (Firebase, Hyperliquid, Binance)
- Où obtenir chaque clé API
- Configuration Firebase Service Accounts
- Troubleshooting CI/CD

**Utilisation** : Suivre pour setup déploiement sur branches `dev`/`release`/`main`.

---

### workflows/deploy.yml.example

**Template GitHub Actions** déploiement multi-environnements :
- Déploiement auto par branche (dev → testnet, main → mainnet)
- Création `.env.*` depuis GitHub Secrets
- Build + déploiement Firebase Hosting

**Utilisation** :
```bash
cp workflows/deploy.yml.example workflows/deploy.yml
# Adapter à votre plateforme (Vercel, Netlify, etc.)
git add workflows/deploy.yml
git commit -m "ci: add deployment workflow"
```

---

## 🔗 Liens Rapides

**Documentation principale** :
- [QUICKSTART.md](../QUICKSTART.md) - Démarrage 5 min
- [docs/ENVIRONMENTS.md](../docs/ENVIRONMENTS.md) - Environnements détaillés
- [docs/INDEX.md](../docs/INDEX.md) - Index navigation docs

**CI/CD** :
- [SECRETS_SETUP.md](./SECRETS_SETUP.md) - Configuration secrets
- [workflows/deploy.yml.example](./workflows/deploy.yml.example) - Template workflow

---

**Dernière mise à jour** : 24 novembre 2025
