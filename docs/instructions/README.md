# 🧭 Hub des Instructions COOKIE

Ce dossier centralise **toutes les consignes opérationnelles** du projet (intégrations API, guidelines Copilot, paiement Stripe, etc.). L’objectif est d’éviter la dispersion d’informations entre la racine, `.github/` et `docs/` afin de limiter les répétitions.

## 📑 Cartographie des instructions

| Domaine | Contenu principal | Fichiers | Dernière mise à jour |
|---------|------------------|----------|-----------------------|
| Copilot & Workflow | Règles de contribution, conventions, checklist dev | [`../.github/copilot-instructions.md`](../../.github/copilot-instructions.md) | 24 nov. 2025 |
| Stripe Checkout | Implémentation complète de `createCheckoutSession`, structure des pages, secrets Firebase | [`stripe-checkout.md`](./stripe-checkout.md) | 28 nov. 2025 |
| Stripe Webhooks | Ajout de `handleStripeWebhook`, gestion des événements `checkout.session.completed` | [`../../.github/instructionStripeWebhooks.md`](../../.github/instructionStripeWebhooks.md) | 24 nov. 2025 |
| Stripe Function Deploy | Procédure de déploiement ciblé (CLI Firebase) | [`../../.github/deployStripeWebhookFunction.md`](../../.github/deployStripeWebhookFunction.md) | 24 nov. 2025 |
| Binance / Hyperliquid | Rappel des sources de vérité (NOWNodes en pause) | [`binance.md`](./binance.md) | 28 nov. 2025 |
| Documentation générale | Vue d’ensemble, quickstart, environnements | [`../INDEX.md`](../INDEX.md) | 24 nov. 2025 |

> ℹ️ Les fichiers historiques `instruction*.md` à la racine ont été transformés en pointeurs vers ce dossier pour éviter toute divergence de contenu.

## 🧱 Organisation

- **`stripe-checkout.md`** : recette technique complète pour le flux Stripe (front + Firebase Functions + secrets).
- **`binance.md`** : arbitrage des sources de prix (Hyperliquid vs Binance) et rappel que NOWNodes n’est pas utilisé tant que la feuille de route on-chain n’est pas activée.
- **`compliance-audit-2025-11-28.md`** : état des lieux des consignes appliquées vs réelles implémentations.
- **Docs `.github/`** : guidelines Copilot, secrets, webhooks Stripe, CI/CD. Liens consolidés ci-dessus pour éviter les doublons.

## ✅ Bonnes pratiques de maintenance

1. **Toujours éditer ici** les instructions avant de communiquer ailleurs.
2. **Pointer depuis les README** (racine, docs) vers cette page plutôt que copier/coller des extraits.
3. **Mettre à jour la table** dès qu’un document change de statut ou de version.
4. **Archiver les anciennes consignes** via Git (pas besoin de fichiers `_OLD`).

En cas de nouvelle intégration (ex : MCP supplémentaire, API tiers), crée un sous-fichier dans ce dossier et référence-le dans la table. Cela garantit des « économies d’échelle » documentaires tout en respectant les workflows existants. 💾
