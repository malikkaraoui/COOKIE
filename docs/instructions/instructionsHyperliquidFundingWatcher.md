# Hyperliquid – Stratégie Funding (watcher Firebase 24/7)

> Document d’instructions pour Copilot (IA → IA).  
> Objectif : implémenter une **surveillance automatique du funding Hyperliquid** et une **stratégie d’entrée / sortie** basée sur ce funding, exécutée côté **Firebase Functions**, même quand l’utilisateur dort.

---

## 1. Contexte et objectif

Nous travaillons dans un projet TypeScript/Node avec :

- **Firebase Functions** (Cloud Functions)  
- Hyperliquid (testnet ou mainnet) déjà intégré dans le projet via un client HTTP existant  
- Une architecture souhaitée de type :
  - `functions/src/services` → appels API (Hyperliquid)
  - `functions/src/strategies` → logique de stratégie
  - `functions/src/config` → constantes, seuils
  - `functions/src/store` → persistance de l’état (Firestore ou Realtime Database)

**Objectif de la fonction :**

1. Tourner régulièrement (ex. toutes les 5 minutes) via une **Cloud Function planifiée**.
2. Pour un ou plusieurs `coins` (ex. `BTC`):
   - Lire le **funding rate** et les infos de marché sur Hyperliquid.
   - Décider d’**ouvrir** une position (ou double position) ou de **fermer** une position déjà ouverte.
3. Implémenter **une stratégie simple, disciplinée** :

   - **Cas A – Funding finance les shorts (funding > 0)**  
     → Stratégie **double jambe** :
       - **Short perp** (pour encaisser le funding)  
       - **Long spot** (avec la moitié du capital) pour réduire le risque de liquidation  
       - Exemple : capital alloué = 100 → ~50 sur le perp, ~50 en spot

   - **Cas B – Funding finance les longs (funding < 0)**  
     → Stratégie **simple** :
       - **Long perp uniquement**
       - Pas de “contre-jambe” spot car peu pertinente dans cette configuration
       - Sortie quand la combinaison *funding + PnL prix* n’est plus attractive

   - **Sortie systématique** quand :
       - le funding n’est plus intéressant (passe sous un seuil)
       - OU la performance globale de la position (en %) repasse sous un seuil (ex. < 1% de gain, ou repasse vers 0).

---

## 2. Hyperliquid – API et primitives à utiliser

> Hypothèse : il existe déjà dans le projet un client Hyperliquid ou une logique similaire.  
> Sinon, Copilot doit créer un petit service dédié dans `functions/src/services/hyperliquid.ts`.

### 2.1. Fonctions de base à exposer dans `hyperliquid.ts`

Créer (ou compléter) ce service avec au minimum :

```ts
// 1) Récupérer funding + meta pour un coin perp
export async function getPerpFundingInfo(coin: string) {
  // Appeler l'endpoint info/meta/funding d'Hyperliquid
  // Retour attendu (exemple d'interface) :
  // {
  //   coin: string;
  //   fundingRate: number;  // taux actuel (par période)
  //   fundingTimeMs: number; // timestamp du prochain/dernier funding
  //   markPx: number;
  // }
}

// 2) Récupérer un prix de référence spot/mid pour le coin (pour calculer tailles)
export async function getSpotMidPrice(coin: string): Promise<number> {
  // Appel au endpoint d'Hyperliquid pour récupérer le mid spot correspondant
}

// 3) Ouvrir une position perp (market) sur Hyperliquid
export type PerpSide = 'LONG' | 'SHORT';

export async function openPerpPosition(params: {
  coin: string;
  side: PerpSide;
  size: number;        // taille en coin (BTC, ETH, etc.)
  leverage: number;    // levier désiré
}): Promise<{ positionId: string; filledSize: number; entryPx: number }> {
  //  - configurer le levier si nécessaire
  //  - envoyer un ordre marché perp via l'API Hyperliquid
}

// 4) Fermer une position perp existante (market reduce-only)
export async function closePerpPosition(params: {
  coin: string;
  side: PerpSide; // side de la position ouverte
  size: number;
}): Promise<void> {
  //  - envoyer un ordre reduce-only dans le sens opposé
}

// 5) Ouvrir / fermer du spot (uniquement côté "BUY" pour long spot)
export async function buySpot(params: {
  coin: string;
  notionalUsd: number;
}): Promise<{ filledQty: number; avgPx: number }> {
  // utilise spot mid / best prix pour estimer la taille en coin, puis envoie un ordre spot d'achat
}

export async function sellSpot(params: {
  coin: string;
  qty: number;
}): Promise<void> {
  // ordre spot de vente pour libérer la position longue
}
