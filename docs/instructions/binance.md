# Binance / Hyperliquid – Directives d’intégration

## 🎯 Objectif

Clarifier l’utilisation des différentes sources de prix : **Hyperliquid API** et **Binance Spot API** restent les seules références pour les cotations en temps réel. L’intégration **NOWNodes** (RPC BSC) est volontairement en pause.

## ✅ À faire

- Continuer d’utiliser **Hyperliquid API** pour les 10 tokens principaux.
- Continuer d’utiliser **Binance Spot API** pour **BNB** et les tokens BEP-20 listés dans `src/config/binanceTrackedTokens.js`.
- Mettre en cache les prix dans Firebase (`priceTokenHyper` / `priceTokenBinance`) via les services existants (`setCachedPriceHyper`, `setCachedPriceBinance`).

## ⛔️ À ne pas faire

- **Ne pas brancher NOWNodes** pour les prix de marché (même en test).
- Ne pas ajouter de dépendance RPC/WSS supplémentaire côté front sans validation.
- Ne pas mélanger balance on-chain (futur scope) et feed de prix (scope actuel).

## 🔭 Futur

- Les données on-chain (balances, transactions) via NOWNodes resteront un sujet ultérieur. Quand le chantier démarrera, la nouvelle doc sera ajoutée ici et référencée depuis `docs/INDEX.md`.
