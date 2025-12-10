# 🛠️ Runbooks opérationnels

Ces instructions détaillent les procédures sensibles exécutées par les développeurs (Stripe, Binance, audits). Elles sont **distinctes** de la documentation technique (`docs/`) qui explique le *pourquoi*. Ici, on décrit le *comment* pas à pas.

## 📑 Guide rapide

| Domaine | Runbook | Description | Dernière revue |
|---------|---------|-------------|----------------|
| Paiement | [`stripe-checkout.md`](./stripe-checkout.md) | Implémentation complète du flux Stripe Checkout (front + Firebase Functions + secrets). | 28 nov. 2025 |
| Paiement | [`.github/instructionStripeWebhooks.md`](../../.github/instructionStripeWebhooks.md) | Gestion du webhook Stripe (`checkout.session.completed`). | 24 nov. 2025 |
| Paiement | [`.github/deployStripeWebhookFunction.md`](../../.github/deployStripeWebhookFunction.md) | Procédure de déploiement ciblé du webhook. | 24 nov. 2025 |
| Pricing | [`binance.md`](./binance.md) | Règles d'arbitrage entre Hyperliquid et Binance (NOWNodes en pause). | 28 nov. 2025 |
| Compliance | [`compliance-audit-2025-11-28.md`](./compliance-audit-2025-11-28.md) | État de conformité des instructions (hooks/providers/routing/docs). | 28 nov. 2025 |

## 🔐 Rappels

- **Pas de clés sensibles** en clair dans les runbooks : renvoyer vers les commandes `firebase functions:secrets:*`.
- **Commentaires en français clair** pour toutes les étapes (public visé : dev francophone).
- **Historique Git** = archive : ne pas créer de fichiers `_OLD`.
- **Mise à jour croisée** : lorsqu'un runbook évolue, mettre à jour `instructions/README.md` et ajouter, si besoin, une entrée dans `CHANGELOG.md`.

## 🧭 Workflow recommandé

1. Lire `instructions/README.md` pour confirmer que vous êtes bien dans un runbook (et non dans la doc développeur).
2. Ouvrir le fichier correspondant (ex : `stripe-checkout.md`).
3. Exécuter la procédure étape par étape.
4. Noter toute divergence ou amélioration directement dans le runbook.

> ✉️ Pour proposer un nouveau runbook : créer un fichier dans ce dossier + ajouter une ligne dans le tableau ci-dessus.
