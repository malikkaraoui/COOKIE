# Modélisation des données (Firebase RTDB)

## `/users/{uid}`

```json
{
  "users": {
    "wallet:0xabc...": {
      "email": "karaoui.malik@gmail.com",
      "firstName": "Malik",
      "authProvider": "wallet",
      "membership": {
        "active": true,
        "status": "active",
        "since": 1765354622644
      },
      "products": {
        "COOKIE_PREMIUM": {
          "acquired": true,
          "acquiredAt": 1765354622652
        }
      },
      "selection": {
        "tokens": ["BTC:hyperliquid", "ETH:binance"]
      }
    }
  }
}
```

## `/priceTokenHyper/{symbol}`

```json
{
  "priceTokenHyper": {
    "BTC": {
      "price": 91500.12,
      "prevDayPx": 90210.45,
      "deltaPct": 1.43,
      "updatedAt": 1765354000000
    }
  }
}
```

## `/priceTokenBinance/{symbol}`

```json
{
  "priceTokenBinance": {
    "BTCUSDT": {
      "price": 91480.50,
      "prevDayPx": 90000.00,
      "deltaPct": 1.64,
      "source": "binanceSpot",
      "updatedAt": 1765353950000
    }
  }
}
```

## `/hyperLiquidFundingStrategies/{strategyId}`

```json
{
  "hyperLiquidFundingStrategies": {
    "strategy:btc-long": {
      "status": "monitoring",
      "openedAt": 1765352000000,
      "lastFundingSample": {
        "coin": "BTC",
        "fundingRate": 0.031,
        "predicted": 0.028
      },
      "positions": {
        "current": {
          "side": "long",
          "size": 0.75,
          "entry": 90500.12
        }
      },
      "logs": {
        "latest": "Opened long after funding spike"
      }
    }
  }
}
```

## `/binance/orders/{uid}`

```json
{
  "binance": {
    "orders": {
      "uid_123": {
        "order_1": {
          "symbol": "BTCUSDT",
          "side": "BUY",
          "status": "FILLED",
          "notional": 100,
          "placedAt": 1765352100000
        }
      }
    }
  }
}
```

Actualise ces exemples si la structure RTDB change (nouvelles clés, watchers supplémentaires, nouveaux produits Premium, etc.).
