# 📂 Instructions opérationnelles & Copilot

Ce répertoire regroupe **toutes les consignes qui pilotent la façon de travailler du projet** : procédures sensibles, règles Copilot et runbooks d'intégration. Il se distingue volontairement de `docs/`, qui reste la source de vérité pour la **documentation développeur** (guide d'architecture, quickstart, etc.).

## 🎯 Objectifs

1. **Séparer ce qui est prescriptif** ("fais ceci ainsi") de ce qui est descriptif ("voici comment ça marche").
2. **Supprimer les doublons** entre la racine, `.github/` et `docs/`.
3. **Donner un point d'entrée unique** aux assistants Copilot comme aux humains lorsqu'il s'agit d'exécuter une procédure sensible (paiement, audit, intégration API).

## 🗂️ Structure du dossier

| Dossier | Usage | Contenu principal |
|---------|-------|-------------------|
| `copilot/` | Règles destinées aux assistants IA (Copilot, MCP, automatisations). | Pointeurs vers `.github/copilot-instructions.md`, checklists CI/CD, contraintes rédactionnelles. |
| `operations/` | Runbooks humains : Stripe Checkout, Binance/Hyperliquid, audits de conformité, etc. | Fichiers `.md` détaillant étape par étape les procédures sensibles. |

> 📌 Tout nouveau guide procédural doit vivre ici. Les documents orientés compréhension (architecture, design system, environnements) restent dans `docs/`.

## 🚀 Comment s'en servir ?

1. **Besoin d'une procédure** (déployer une fonction, auditer une intégration, répondre à une exigence Copilot) → venir ici.
2. **Besoin de comprendre le fonctionnement** (architecture cache, routing, UI) → aller dans `docs/` (et consulter `docs/INDEX.md`).
3. **Besoin d'instruire Copilot** → éditer les fichiers de `copilot/` (et le miroir officiel dans `.github/`).

## 🔗 Liens rapides

- Documentation développeur : [`docs/INDEX.md`](../docs/INDEX.md)
- Instructions Copilot (source officielle) : [`.github/copilot-instructions.md`](../.github/copilot-instructions.md)
- Runbooks Stripe : [`instructions/operations/stripe-checkout.md`](./operations/stripe-checkout.md)
- Directives Binance / Hyperliquid : [`instructions/operations/binance.md`](./operations/binance.md)
- Audit conformité consignes : [`instructions/operations/compliance-audit-2025-11-28.md`](./operations/compliance-audit-2025-11-28.md)

## 🧼 Bonnes pratiques

- **Toujours ajouter une table ou un résumé** en tête de chaque instruction pour situer le contexte.
- **Pas de fichiers `_OLD` / `_backup`** : l'historique Git tient lieu d'archive.
- **Mettre à jour cette page** dès qu'une nouvelle instruction est ajoutée ou qu'un fichier change de statut.
- **Croiser les références avec `docs/INDEX.md`** afin que les développeurs sachent s'il s'agit d'un runbook (ici) ou d'une documentation (dans `docs/`).

En structurant explicitement cette frontière, on évite que les assistants comme les humains "cherchent partout" et on sécurise les opérations sensibles. ✅
