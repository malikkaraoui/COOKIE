````markdown
# 🧭 Routing COOKIE – état réel (décembre 2025)

Ce document reflète **les routes réellement déclarées** dans `src/components/AppLayout.jsx`. Mise à jour Étape D : toutes les URLs produit passent en kebab-case, avec redirections automatiques depuis les anciennes versions PascalCase.

## 📋 Table de vérité (kebab-case)

| URL | Composant React | Description | Notes |
|-----|-----------------|-------------|-------|
| `/` | – | Redirige immédiatement vers `/epicerie-fine` | `Navigate to="/epicerie-fine"` |
| `/epicerie-fine` | `pages/page1.jsx` | Vue principale « Épicerie fine » (sélection & drag Hyperliquid) | Accent retiré pour compatibilité URL |
| `/ma-cuisine` | `pages/page2.jsx` | Formulaire de construction d’ordre Hyperliquid | Drop zone principale |
| `/la-marmite` | `pages/LaMarmite.jsx` | Page communautaire (votes/recettes) | Contenu social |
| `/profile` | `pages/ProfilePage.jsx` | Profil utilisateur Google | Déjà en kebab-case |
| `/stripe` | `pages/StripePage.jsx` | Lancement du checkout Stripe Premium | Réservé users loggés |
| `/stripe-success` | `pages/StripeSuccessPage.jsx` | Callback Stripe succès | Invariant (Stripe docs) |
| `/stripe-cancel` | `pages/StripeCancelPage.jsx` | Callback Stripe annulation | Invariant |

> ✅ Aucune autre `Route` n’est montée côté client pour l’instant.

## 🔁 Compatibilité ascendante

Les anciennes URLs restent fonctionnelles grâce à des `<Navigate replace />` dans `AppLayout` :

| Ancienne URL | Nouvelle cible |
|--------------|----------------|
| `/ÉpicerieFine` | `/epicerie-fine` |
| `/MaCuisine` | `/ma-cuisine` |
| `/LaMarmite` | `/la-marmite` |
| `/Stripe` | `/stripe` |
| `/StripeSuccess` | `/stripe-success` |
| `/StripeCancel` | `/stripe-cancel` |
| `/Profile` | `/profile` |

Ces redirects couvrent les deep-links partagés avant Étape D et évitent de casser les callbacks Stripe déjà configurés.

## ✅ Convention cible

- **kebab-case ASCII** pour toutes les URLs exposées (y compris les écrans principaux).
- **Redirections systématiques** lors d’un renommage (React Router + Firebase Hosting si nécessaire).
- **Documentation immédiatement alignée** (ce fichier + CHANGELOG) pour toute modification future.

## 🗓️ Historique rapide

- **23 nov. 2025** : `/page1` → `/MarmitonCommunautaire`, `/page2` → `/MaCuisine`, `/page4` → `/BinanceToken`, redirection `/` → `/MarmitonCommunautaire`.
- **3 déc. 2025 (Étape D)** : passage généralisé en kebab-case (`/epicerie-fine`, `/ma-cuisine`, `/la-marmite`, `/stripe`). Ajout des redirections rétro-compatibles ci-dessus.

## ✅ Bonnes pratiques

1. **Aligner route & wording Sidebar** (même intitulé visuel que l’URL). Les liens ont été mis à jour en même temps que les Routes.
2. **Documenter toute nouvelle route** dans la table principale dès son ajout à `AppLayout.jsx`.
3. **Prévoir des redirections** (React Router + Hosting) avant de renommer une URL déjà utilisée par les utilisateurs ou par Stripe.
4. **Notifier l’équipe** (Slack + CHANGELOG) lors d’un changement visible, en rappelant les impacts deep-link/Stripe.

## 🔮 Routes futures (planifiées)

| Route envisagée | Statut | Commentaire |
|-----------------|--------|-------------|
| `/hyperliquid-order-book` | À définir | Carnet d’ordres BTC/ETH basé sur Hyperliquid. |
| `/portefeuille-on-chain` | En veille | Dépend de l’intégration NOWNodes. |
| `/parametres` | Idée | Page settings (capital initial, préférences). |
| `/statistiques` | Idée | Vue analytique (perf, corrélations). |

> Lorsqu’une de ces routes devient réelle, l’ajouter à la table principale + décrire la migration éventuelle depuis les anciennes URLs.

````
