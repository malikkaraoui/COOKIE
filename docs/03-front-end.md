# Front-end (React / Vite / Tailwind)

## Stack & outils

- **React 18 + Vite** pour un développement rapide (HMR) et une sortie optimisée.
- **JavaScript + TypeScript** selon les dossiers (`src/hooks` est majoritairement TS, `src/pages` JS/JSX).
- **Tailwind + CSS personnalisées** (ex : `src/pages/MaCuisine.css`) pour la mise en page et les thèmes.
- **Context API & hooks maison** (`src/context`, `src/hooks`) pour propager l’état utilisateur, les prix et les préférences.
- **Sonner** pour les notifications (`src/components/ui/ToastProvider.tsx`).

## Organisation du dossier `src/`

- `pages/` : routes principales (ex : `page2.jsx` pour *Ma Cuisine*, `EpicerieFine.jsx`, etc.).
- `components/` & `elements/` : briques UI réutilisables (`KitchenPerformanceChart`, `TokenTile`, boutons auth, etc.).
- `hooks/` : intégrations data (`useHyperliquidHistory`, `useCcxtHistory`, `useTradeNotifications`).
- `lib/` : helpers pour formatter les prix, orchestrer les appels (ex : `lib/hyperliquidHistory.js`).
- `services/` : wrappers API/SDK (Firebase, Stripe, Hyperliquid) et providers contextuels.

## Pages métiers

1. **Épicerie fine** : sélection des tokens, constitution de paniers, interaction avec RTDB pour stocker les choix.
2. **Ma Cuisine** (route `/ma-cuisine`) : dashboard principal (ordres, positions, chart multi-jours, backtests express).
3. **La Marmite** : vue communautaire / agrégation des stratégies.
4. **Bouillon** : zone d’expérimentation (pilotage spot, batch d’ordres testnet).
5. **Acheter Premium** : déclenche le flux Stripe puis synchronise `/users/{uid}/products`.

Chaque page importe ses styles modulaires et des composants atomiques (tuiles, charts, métriques) pour garder une UI cohérente.

## Accès aux données

- **Firebase Realtime Database** : écoute via le SDK (`onValue`, `ref`) pour `/users`, `/priceTokenHyper`, `/priceTokenBinance`.
- **Cloud Functions HTTP/callable** : fetch direct depuis le front pour `placeTestOrder`, `createCheckoutSession`, `ccxtHistory`, etc.
- **Hooks dédiés** : `useCcxtHistory` orchestre l’appel de la Function HTTPS `ccxtHistory` et met en cache le résultat côté front.

Extrait représentatif (simplifié) de `src/pages/page2.jsx` :

```tsx
// Section fusionnée Backtests + Historique multi-jours
<section className="k-card k-card--accent k-card--stacked">
  <div className="k-card__head">
    <p className="k-tag">Backtests · Vision 5 / 10 / 15 / 20 jours</p>
    <h3 className="k-card__title">Résultats express & historique multi-jours</h3>
  </div>
  <div className="k-results-stage">
    <PortfolioResults results={results} />
    <div className="k-results-stage__chart">
      <KitchenPerformanceChart
        tokensData={tokensData}
        weights={weights}
        capital={projectionCapital}
        historyData={historicalReturns}
        ccxtHistoryData={ccxtHistoryData}
        historyLoading={historicalLoading || ccxtHistoryLoading}
        historyError={historicalError || ccxtHistoryError}
      />
    </div>
  </div>
</section>
```

## Notifications

Les toasts Sonner sont montés via `src/components/ui/ToastProvider.tsx` :

```tsx
import { Toaster } from "sonner";

export function ToastProvider() {
  return <Toaster position="top-right" richColors expand />
}
```

Les hooks comme `useTradeNotifications` déclenchent `toast.success` / `toast.error` pour informer l’utilisateur lorsqu’un ordre ou une stratégie change d’état.
