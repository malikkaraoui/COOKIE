# Binance Spot Testnet – Plan d'intégration des ordres

## 🧭 Contexte & objectifs
- **But** : permettre à la page *Cuisine* (le front) d'orchestrer des ordres Binance Spot Testnet au même titre que les ordres Hyperliquid déjà existants.
- **Approche** : s'appuyer sur des Cloud Functions Firebase pour signer et relayer les ordres, afin de garder les clés API côté backend.
- **Scope** : modes `LIMIT`, `MARKET`, `STOP_LOSS(_LIMIT)` et structures avancées (OCO/OTO/OTOCO) à terme. La première itération couvre LIMIT/MARKET + cancel/test.

## 🔗 Architecture cible
```
UI (page Cuisine) → callable function Firebase ("binancePlaceTestnetOrder") →
  - Gestion des clés + signature (HMAC ou RSA/Ed25519)
  - Validation (exchangeInfo, filtres, rate limits)
  - Envoi POST /api/v3/order sur https://testnet.binance.vision/api
← Webhook Firebase/RTDB pour refléter l'état (fills, erreurs)
```
- **Front** : réutilise la logique des tokens Hyperliquid (sélecteur, montants, validations UI) + un "router" `venue=binance-testnet`.
- **Backend** : nouvelle fonction callable (ou HTTPS endpoint protégé) dans `functions/src/handlers/binanceOrders.ts` + utilitaires de signature dans `functions/src/hyperliquidClient.ts` (ou équivalent Binance).
- **Données temps réel** : abonnements WebSocket côté backend (User Data Stream) -> push vers Firebase RTDB/Firestore pour afficher statut en Front.

## 🔐 Gestion des secrets & permissions
| Secret | Où le stocker | Notes |
| --- | --- | --- |
| `BINANCE_TESTNET_API_KEY` | `firebase functions:config:set binance.testnet_api_key="..."` | Sert à l'en-tête `X-MBX-APIKEY`. |
| `BINANCE_TESTNET_SECRET` (HMAC) **ou** clé privée RSA/Ed25519 | `config/credentials/binance-testnet/` + Config Firebase (chemin fichier) | Prévoir support HMAC (simple) et RSA/Ed25519 (pour WebSocket API). |
| `BINANCE_TESTNET_KEY_TYPE` | Config Firebase | Valeurs: `HMAC` (par défaut), `RSA`, `ED25519`. |
| `BINANCE_TESTNET_RECV_WINDOW` | Config (optionnel) | Par ex. `5000`. |
| `BINANCE_TESTNET_USER_STREAM_KEY` | Stocké runtime (RTDB/Firestore) | Token retourné par `userDataStream.start`. |

**Bonnes pratiques**
- Ne jamais exposer ces clés au front. La fonction callable reçoit seulement les paramètres d'ordre (symbol, qty, etc.).
- Fournir une commande `npm run functions:set-binance-secrets` (script) pour éviter les oublis.
- Ajouter `config/credentials/binance-testnet/README.md` avec procédure pour les clés RSA/Ed25519.

## ⚙️ Firebase Cloud Functions
### 1. Fonction `binancePlaceTestnetOrder`
- **Type**: `onCall` (permet d'ajouter des claims d'authentification Firebase Auth avant d'autoriser l'appel).
- **Entrée** (exemple):
  ```json
  {
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "quantity": "0.01",
    "price": "42000",
    "timeInForce": "GTC",
    "clientOrderId": "cuisine-uuid",
    "mode": "dryRun" | "live",
    "meta": { "source": "Cuisine", "userUid": "..." }
  }
  ```
- **Étapes**:
  1. Vérifier l'utilisateur (Firebase Auth) + vérifier qu'il a la permission "cuisine:trade" (custom claim ou rôle Firestore).
  2. Charger la clé + secret selon `BINANCE_TESTNET_KEY_TYPE`.
  3. Appeler `GET /api/v3/exchangeInfo?symbol=...` (caché 5 min) → vérifier filtres `LOT_SIZE`, `PRICE_FILTER`, `NOTIONAL`.
  4. Construire le payload `symbol=...&side=...&type=...&timestamp=...` + `recvWindow`.
  5. Signer le payload:
     - HMAC: `crypto.createHmac('sha256', secret).update(query).digest('hex')`
     - RSA: `openssl sign` → Base64 → URL-encode.
     - Ed25519: `crypto.sign(null, Buffer.from(payload), privateKey)`.
  6. POST `https://testnet.binance.vision/api/v3/order` avec en-tête `X-MBX-APIKEY`.
  7. Stocker la réponse et un log structuré (`orders/{uid}/{orderId}`) pour l'historique.
  8. Retourner au front un résumé (`status`, `fills`, `errors`).

- **Mode dryRun**: si `mode="dryRun"`, utiliser `POST /api/v3/order/test` + option `computeCommissionRates` pour valider sans exécuter.

### 2. Fonction `binanceCancelTestnetOrder`
- Entrée: `symbol`, `orderId` **ou** `origClientOrderId`.
- Appel `DELETE /api/v3/order`.

### 3. Fonction `binanceSyncUserStream`
- Programme CRON (scheduler) pour maintenir un `listenKey` (tant que l’on reste sur l’ancienne API) **ou** pour ouvrir un WebSocket API et relayer `executionReport` → RTDB.
- Persister l’état dans `dataconnect`/Firestore pour que la page Cuisine voie en temps réel les updates.

## 🧱 Intégration front (*page Cuisine*)
1. **Sélecteur de venue** : ajouter `Binance Testnet` aux tokens disponibles (avec un badge "Testnet").
2. **Formulaire** : réutiliser `page2` (manuel) pour forcer `stepSize` / `tickSize` en provenance des filtres (disponibles via Cloud Function `binanceExchangeInfo`).
3. **Appel callable** : via `httpsCallable('binancePlaceTestnetOrder')` avec les champs du formulaire.
4. **Feedback** : s’abonner aux `orders/{uid}` dans Firebase pour afficher `NEW`, `FILLED`, `PARTIALLY_FILLED`, `CANCELED`.
5. **Fallback** : en cas d’erreur (ex: `-1021` timestamp), afficher toast + bouton "Resync server time" (appelle `GET /api/v3/time`).

## 🧪 Validation & tests
- **Unit** : mocker `axios`/`fetch` pour tester signature + validation.
- **Integration** : script `scripts/binance-testnet-demo.js` (Node) pour vérifier que les secrets sont bien injectés et qu’un ordre LIMIT passe de `NEW` à `FILLED` (utiliser petites quantités, ex: `0.001`).
- **E2E** : Cypress/Playwright pour le flux Cuisine complet (sélection token, envoi, visualisation). Utiliser un flag `VITE_ENABLE_BINANCE_TESTNET=1` pour n’activer ces tests que sur l’environnement dédié.

## ✅ Étapes d’implémentation prévues
1. **Backend**
   - [ ] Ajouter les secrets (commande `firebase functions:config:set ...`).
   - [ ] Créer `functions/src/services/binanceTestnet.ts` (client REST + signatures + cache exchangeInfo).
   - [ ] Ajouter `binancePlaceTestnetOrder`, `binanceCancelTestnetOrder`, `binanceExchangeInfo` (callable) + tests Jest.
   - [ ] Déployer functions (`npm run deploy:functions -- --only binance*`).
2. **Frontend**
   - [ ] Ajouter un provider `BinanceVenueContext` (ou étendre `MarketDataContext`) pour charger filtres/testnet info.
   - [ ] Étendre la page Cuisine (composant `BtcTile` ou un nouveau `BinanceTile`) avec un sélecteur d’ordres + hook `useCallable`.
   - [ ] Ajouter un module `services/binanceOrders.js` pour normaliser les réponses.
   - [ ] Mettre à jour la documentation utilisateurs (tooltip "Testnet seulement").
3. **Monitoring**
   - [ ] Ajouter logs dans `functions/logger.ts` (structured logging) + alertes (Stackdriver) sur erreurs > 5%.
   - [ ] Ajouter un dashboard dans la page admin (nombre d’ordres envoyés, statut, latence).

## 📌 Points d’attention
- **Resets testnet** : planifier un job qui détecte un reset (erreur `-2014` / balances reset) et notifie via Slack/Discord.
- **Rate Limits** : surveiller `X-MBX-ORDER-COUNT-*` dans les headers et appeler `GET /api/v3/rateLimit/order` régulièrement pour éviter les 429.
- **Sécurité** : limiter la fonction callable à des utilisateurs autorisés, vérifier les paramètres côté backend (never trust front).
- **Future** : possibilité de migrer vers l’API live (mêmes endpoints, changer la base URL + clés) une fois le flux validé sur testnet.

---
Ce document sert de base pour l’implémentation à venir. Prochaine étape : créer le client Binance dans `functions/` puis brancher la page Cuisine pour piloter les ordres testnet.
