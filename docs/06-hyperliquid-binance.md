# APIs Hyperliquid & Binance

## Hyperliquid

- **Proxy** : `hyperliquidInfoProxy` interroge l’endpoint `/info` (`metaAndAssetCtxs`) pour obtenir prix, funding et open interest, puis renvoie le JSON au front.
- **Ordres** : `placeTestOrder`, `closeAllPositions`, `listOpenOrders` manipulent les positions perp. Les appels nécessitent les identifiants côté serveur (jamais exposés au front).
- **Historique** : `useHyperliquidHistory` lit les séries stockées dans RTDB ou via les Cloud Functions pour alimenter `KitchenPerformanceChart`.
- **Stockage** : les prix sont persistés sous `/priceTokenHyper/{coin}` avec `price`, `prevDayPx`, `deltaPct`.

## Binance

- **Handlers Node** : `placeBinanceSpotOrder`, `listBinanceOpenOrders`, `listBinanceSpotBalances`, `cancelBinanceOpenOrdersOnSymbol`, `closeAndDustBinancePositions` (testnet ou mainnet selon clés). Ils utilisent le SDK officiel ou des appels REST signés.
- **Batch multi-ordres** : le front Bouillon compose des ordres GTC, puis appelle les Functions pour les exécuter.
- **Stockage** : `/priceTokenBinance/{symbol}` contient le dernier prix spot; `/binance/orders/{uid}` historise les ordres testnet.

## Watchers & stratégies

- **Funding watcher** : `watchHyperliquidFunding` déclenche périodiquement `maybeOpenFundingPosition` / `maybeCloseFundingPosition` et écrit l’état dans `/hyperLiquidFundingStrategies`.
- **Stratégie multi-jours** : le front combine l’historique Hyperliquid avec les retours CCXT (`ccxtHistory`) pour comparer la performance pondérée du portefeuille aux sous-jacents.

## Exemple d’appel front → Cloud Function

```ts
// src/lib/hyperliquidHistory.js
export async function fetchHyperliquidHistory(symbols) {
  const url = `${import.meta.env.VITE_FUNCTIONS_URL}/hyperliquidInfoProxy?resource=chart&symbol=${symbols.join(',')}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Hyperliquid history failed')
  return response.json()
}
```

Adapter ce helper selon l’URL réelle déployée (Firebase region). L’objectif est de centraliser tous les appels exchange côté serveur pour garder les clés privées.
