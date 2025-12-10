# 🤖 Instructions Copilot

Cette section regroupe les éléments destinés **exclusivement** aux assistants (GitHub Copilot, MCP, ou tout agent automatisé). Les règles officielles qui guident Copilot restent stockées dans `.github/copilot-instructions.md`, car GitHub requiert ce chemin, mais ce dossier offre :

- un **résumé humain** des contraintes importantes ;
- des **pointeurs directs** vers les fichiers critiques dans `.github/` ;
- de l'espace pour ajouter des notes locales ou des variantes temporaires sans polluer la doc développeur.

## 📂 Fichiers clés

| Nom | Description | Source de vérité |
|-----|-------------|------------------|
| `SUMMARY.md` *(à créer si besoin)* | Notes additionnelles spécifiques à une mission courte (ex : sprint compliance). | Ce dossier |
| `../.github/copilot-instructions.md` | Règles globales (workflow, conventions, interdits). | `.github/` |
| `../.github/instructionStripeWebhooks.md` | Procédure Copilot pour maintenir le webhook Stripe. | `.github/` |
| `../.github/GITHUB_ACTIONS_SETUP.md` | Aide Copilot/DevOps pour configurer les workflows. | `.github/` |

## ✅ Bonnes pratiques

1. **Tenir ce dossier synchronisé** avec `.github/` (mettre à jour les tableaux quand une nouvelle règle apparaît).
2. **Écrire en français clair** (comme demandé) et bannir les copier-coller de la doc développeur.
3. **Signer les instructions sensibles** (Stripe, Hyperliquid) avec la date de dernière revue.
4. **Informer les humains** (via `docs/INDEX.md` ou le changelog) lorsqu'une contrainte Copilot impacte le développement.

> 💡 Les assistants ne doivent pas se fier à `docs/` pour les instructions opérationnelles : ils doivent passer par ce dossier (et les fichiers `.github`) pour tout ce qui est prescriptif.
