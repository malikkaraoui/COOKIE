# Introduction

## Vision

$COOKIE vise à traduire la complexité des exchanges crypto (CEX comme Binance, perp house comme Hyperliquid) en expériences familières façon banque mutualiste. La plateforme raconte l’épargne comme une cuisine partagée : on choisit des ingrédients dans l’Épicerie fine, on assemble une recette dans Ma Cuisine, on partage les meilleurs plats dans la Marmite et on sécurise la Tirelire commune. Chaque écran combine données marché, pédagogie et interactions communautaires pour rendre les stratégies compréhensibles et actionnables.

## Objectifs techniques

- Garantir un front-end réactif et responsive basé sur React, Vite et Tailwind, avec des composants modulaires (`src/components`, `src/pages`).
- Centraliser les interactions sensibles (ordres Hyperliquid/Binance, watchers, paiement) via des Firebase Cloud Functions (`functions/src`).
- Stocker les états persistants (profils, inventaires, métriques de prix, stratégies funding) dans Firebase Realtime Database.
- Gérer les abonnements Premium avec Stripe Checkout + Webhooks afin d’activer dynamiquement les fonctionnalités dans `/users/{uid}/products/`.
- Préparer l’orchestration multi-plateformes (ajout d’autres CEX/DEX, déploiement d’algos) en gardant une architecture facilement extensible.
