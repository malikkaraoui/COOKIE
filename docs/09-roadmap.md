# Roadmap & TODO techniques

1. **Orchestration multi-plateformes**
   - Ajouter de nouveaux exchanges (OKX, Bybit) via des Cloud Functions dédiées.
   - Mutualiser la logique d’ordonnancement (queue + retry) pour Hyperliquid/Binance.

2. **Marmite communautaire**
   - Formaliser le staking collectif (partage des recettes, gouvernance on-chain légère).
   - Journaliser on-chain certaines décisions clés (mode "Chef confirmé").

3. **Mode "On baisse le rideau"**
   - Automatiser la fermeture des positions, la conversion et les notifications (hook `useHyperliquidCurtain`).
   - Ajouter un bouton d’urgence côté front (state global + Function `closeAllPositions`).

4. **Sécurité & Observabilité**
   - Ajouter des tests unitaires pour les strategies (`functions/src/strategies`).
   - Brancher un système de logs structuré (OpenTelemetry + BigQuery).
   - Activer la rotation automatique des clés API.

5. **Expérience utilisateur**
   - Améliorer les tuiles Ma Cuisine côté mobile (Tailwind + CSS variables).
   - Ajouter des walkthroughs interactifs (toast Sonner + modals) pour guider les nouveaux Chefs.

6. **Data & Modélisation**
   - Enrichir `/priceTokenHyper` et `/priceTokenBinance` avec des champs de volatilité.
   - Documenter les nouveaux nœuds dès qu’une stratégie/fonction change la structure RTDB.
