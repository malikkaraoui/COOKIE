# Audit d’application des instructions – 28 nov. 2025

## 🎯 Périmètre de vérification

- Structure hooks/providers/context.
- Utilisation de l’état React et des Context API.
- Mise en place du routing (noms d’URL, alignement doc ↔ code).
- Hygiène documentaire (`instruction*.md`).

## ✅ Points conformes

| Sujet | Constat | Référence |
|-------|---------|-----------|
| Auth & context | `AuthProvider`, `NavigationProvider`, `SelectedTokensProvider`, `MarketDataProvider` enveloppent bien l’app dans `src/main.jsx`. | `src/main.jsx`, `src/context/*.jsx` |
| State local | Composants clés (Sidebar, StripePage, TokenTile) utilisent `useState`/`useEffect` de façon ciblée pour l’UI. | `src/components/Sidebar.jsx`, `src/pages/StripePage.jsx` |
| Stripe callable | Implémentation actuelle respecte les consignes (`httpsCallable`, `defineSecret`). | `src/lib/stripeCheckout.js`, `functions/index.js` |
| Documentation centrale | `.github/copilot-instructions.md` à jour et référencé via `instruction EX`. | `.github/copilot-instructions.md` |

## ⚠️ Écarts observés

| Domaine | Écart | Impact | Fichier(s) |
|---------|-------|--------|------------|
| Hooks vs Providers | `useBinancePrices` déclenche un polling global + écritures Firebase directement depuis un hook côté client. Le guide architecture stipule que ce type de logique doit vivre dans un Provider (ex anti-pattern illustré). | Risque de double exécution (StrictMode), + logique globale difficile à tester/mocker. | `src/hooks/useBinancePrices.js`, `.github/copilot-instructions.md` (section "Convention Providers vs Hooks") |
| Structure dossiers | Les providers restent dans `src/context/` au lieu de `src/providers/` comme demandé. | Rend la séparation hooks/providers moins explicite pour les nouveaux devs. | `src/context/*` |
| Fichiers backup | Présence de `MarketDataContext_BACKUP_WORKING.jsx`, `_OLD`, `STEP1`. Les instructions interdisent les fichiers `_BACKUP`. | Risque de divergence et de confusion lors des recherches globales. | `src/context/MarketDataContext_*` |
| Routing naming | La doc impose PascalCase (ex `/MarmitonCommunautaire`). Le code actuel utilise `/ÉpicerieFine`, `/MaCuisine`, `/LaMarmite`, `/stripe-success`, `/stripe-cancel`. | Documentation obsolète + incohérence sur la règle (pages Stripe en kebab-case). | `src/components/AppLayout.jsx`, `docs/ROUTING.md` |
| Docs dispersées | Avant réorganisation, `instructionBinanceAPI.md` et `instructionStripe.md` vivaient hors `docs/`. | Difficulté à savoir quelle version est la bonne. | (ancien emplacement racine) |

## 📌 Actions recommandées (priorisées)

1. **Déplacer la logique Binance polling dans un Provider** (ex : `BinancePriceProvider` sous `src/providers/`), puis exposer un hook de lecture (`useBinanceFeed`).
2. **Créer `src/providers/`** et migrer progressivement `MarketDataProvider`, `SelectedTokensProvider`, etc., pour refléter la convention décrite dans les instructions.
3. **Supprimer les fichiers `_BACKUP`** devenus obsolètes (l’historique Git suffit).
4. **Aligner la documentation routing** : soit renommer les routes pour suivre `docs/ROUTING.md`, soit mettre à jour la doc + la convention (y compris pour les pages Stripe pour respecter PascalCase).
5. **Continuer la centralisation documentaire** via `instructions/README.md` et pointer les futurs guides (NOWNodes, MCP, etc.) vers ce hub.

---

Audit réalisé le 28/11/2025 – prochaine revue recommandée après implémentation du Provider Binance ou lors de l’ajout d’un nouveau contexte global.
