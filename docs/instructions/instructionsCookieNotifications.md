# instructionsCookieNotifications.md

## 🎯 Objectif

Mettre en place des **notifications in‑app (toasts)** dans COOKIE pour informer l’utilisateur en temps réel de l’état de ses ordres :

- ✅ Ordre exécuté  
- ❌ Ordre fermé par la fonction de surveillance  
- ⏳ Ordre en attente dans le carnet d’ordres  

Tu es **Copilot**.  
Tu travailles dans le projet **COOKIE** (React + TypeScript).  
Ta mission : **implémenter des toasts simples, gratuits et maintenables**, sans changer la logique métier existante, uniquement en la branchant sur un système de notifications.

---

## 1. Choix technique

- Utiliser la librairie de toasts **`sonner`**.  
  - Simple, moderne, compatible TypeScript  
  - API minimale : `toast("...")`, `toast.success("...")`, etc.

---

## 2. Installation

Dans le projet COOKIE, installer la dépendance :

```bash
npm install sonner
# ou
yarn add sonner
# ou
pnpm add sonner
```

👉 Copilot : détecte le gestionnaire de packages déjà utilisé dans le projet et adapte la commande.

---

## 3. Intégration globale

On veut un composant global qui installe `<Toaster />` une seule fois, au niveau racine.

### 3.1. Créer `ToastProvider`

**Fichier à créer :** `src/components/ui/ToastProvider.tsx`  

```tsx
// src/components/ui/ToastProvider.tsx
import React from "react";
import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
    />
  );
}
```

> Si `components/ui/` existe déjà, l’utiliser. Sinon, le créer.

### 3.2. Monter `ToastProvider` au niveau racine

Cas Vite/React classique (entrée `src/main.tsx` par exemple) :

```tsx
// src/main.tsx (adapter au fichier réel)
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { ToastProvider } from "./components/ui/ToastProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider />
    <App />
  </React.StrictMode>
);
```

Cas Next.js App Router (`src/app/layout.tsx`) :

```tsx
// src/app/layout.tsx (adapter au fichier réel)
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/ToastProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
```

👉 Copilot : détecter le vrai point d’entrée du projet COOKIE et y intégrer `<ToastProvider />` proprement.

---

## 4. Hook métier : `useTradeNotifications`

On veut centraliser **toute la logique de texte** dans un hook réutilisable.

**Fichier à créer :** `src/hooks/useTradeNotifications.ts`

```ts
// src/hooks/useTradeNotifications.ts
import { useCallback } from "react";
import { toast } from "sonner";

type OrderSide = "buy" | "sell";

export interface TradeNotificationOrderInfo {
  id: string;        // ID de l'ordre
  symbol: string;   // ex: "BTC/USDT"
  side?: OrderSide; // optionnel : "buy" ou "sell"
}

/**
 * Hook métier pour les notifications d'ordres dans COOKIE.
 */
export function useTradeNotifications() {
  const notifyOrderExecuted = useCallback((order: TradeNotificationOrderInfo) => {
    const { id, symbol, side } = order;
    const sideLabel = side === "buy" ? "achat" : side === "sell" ? "vente" : "ordre";

    toast.success(`✅ ${sideLabel.toUpperCase()} exécuté sur ${symbol}`, {
      description: `ID ordre : ${id}`,
    });
  }, []);

  const notifyOrderClosedByWatcher = useCallback((order: TradeNotificationOrderInfo) => {
    const { id, symbol } = order;

    toast(`🧠 Ordre fermé par la surveillance`, {
      description: `ID : ${id} – ${symbol}`,
    });
  }, []);

  const notifyOrderInOrderBook = useCallback((order: TradeNotificationOrderInfo) => {
    const { id, symbol, side } = order;
    const sideLabel = side === "buy" ? "achat" : side === "sell" ? "vente" : "ordre";

    toast.info(`⏳ ${sideLabel} en attente dans le carnet`, {
      description: `ID : ${id} – ${symbol}`,
    });
  }, []);

  return {
    notifyOrderExecuted,
    notifyOrderClosedByWatcher,
    notifyOrderInOrderBook,
  };
}
```

Objectif : si un jour on change le texte des messages, on le fait **uniquement ici**.

---

## 5. Branchement sur la page “Cuisine” (envoi d’ordre)

Quand l’utilisateur envoie un ordre depuis **la page Cuisine**, et que l’API confirme sa création (ordre placé dans le carnet), on affiche une notif « en attente dans le carnet ».

Copilot doit :

1. Identifier le composant de la page “Cuisine” (ex : `src/pages/Cuisine.tsx`, `src/app/cuisine/page.tsx`, etc.).  
2. Y importer et utiliser `useTradeNotifications`.

Exemple générique :

```tsx
// Exemple dans la page Cuisine (adapter au fichier réel)
import React, { useState } from "react";
import { useTradeNotifications } from "@/hooks/useTradeNotifications";

export function CuisinePage() {
  const { notifyOrderInOrderBook } = useTradeNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePlaceOrder() {
    try {
      setIsSubmitting(true);

      // 1. Appel API existant pour créer l'ordre
      const response = await placeOrderSomewhere(); // à remplacer par la vraie fonction

      // 2. Récupérer les infos principales
      const orderId = response.id;
      const symbol = response.symbol; // ex : "BTC/USDT"
      const side = response.side;     // optionnel

      // 3. Notifier : ordre en attente dans le carnet
      notifyOrderInOrderBook({
        id: orderId,
        symbol,
        side,
      });
    } catch (error) {
      console.error("Erreur lors du placement d'ordre :", error);
      // Plus tard : ajouter une notification d'erreur si souhaité
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* UI existante */}
      <button onClick={handlePlaceOrder} disabled={isSubmitting}>
        {isSubmitting ? "Envoi..." : "Envoyer l’ordre"}
      </button>
    </div>
  );
}
```

👉 Copilot : ne pas changer la logique métier déjà en place, uniquement **brancher** l’appel à `notifyOrderInOrderBook()` après un succès.

---

## 6. Branchement sur le suivi des ordres (WebSocket / DB / polling)

COOKIE suit l’état des ordres via WebSocket, API, ou base de données.  
Nous voulons :

- `notifyOrderExecuted(...)` quand l’ordre passe à **exécuté (FILLED)**  
- `notifyOrderClosedByWatcher(...)` quand l’ordre est **fermé par la fonction de surveillance (Firebase)**

Copilot doit :

1. Trouver où les états d’ordres sont mis à jour (store, hook, composant listener).  
2. Ajouter les notifications **sans réécrire toute la logique**.

Exemple générique de listener :

```tsx
// Exemple de listener (adapter au code réel)
import { useEffect } from "react";
import { useTradeNotifications } from "@/hooks/useTradeNotifications";
import { useOrdersStore } from "@/stores/ordersStore"; // adapter si le store a un autre nom

export function OrdersEventsListener() {
  const { notifyOrderExecuted, notifyOrderClosedByWatcher } = useTradeNotifications();
  const orders = useOrdersStore((s) => s.orders);

  useEffect(() => {
    orders.forEach((order) => {
      if (order.justNowFilled) {
        notifyOrderExecuted({
          id: order.id,
          symbol: order.symbol,
          side: order.side,
        });
      }

      if (order.closedByWatcher) {
        notifyOrderClosedByWatcher({
          id: order.id,
          symbol: order.symbol,
          side: order.side,
        });
      }
    });
  }, [orders, notifyOrderExecuted, notifyOrderClosedByWatcher]);

  return null;
}
```

Ensuite monter le listener dans un layout ou composant racine :

```tsx
// Exemple dans App ou layout
import { OrdersEventsListener } from "@/components/trading/OrdersEventsListener";

export function App() {
  return (
    <>
      <OrdersEventsListener />
      {/* reste de l'app */}
    </>
  );
}
```

Copilot doit adapter le nom des fichiers, des stores et des hooks à la structure **réelle** de COOKIE.

---

## 7. Check‑list de fin

La tâche est réussie si :

1. ✅ `sonner` est installé et `<Toaster />` est monté globalement via `ToastProvider`.  
2. ✅ Le hook `useTradeNotifications` existe dans `src/hooks/useTradeNotifications.ts` avec :  
   - `notifyOrderExecuted`  
   - `notifyOrderClosedByWatcher`  
   - `notifyOrderInOrderBook`  
3. ✅ La page “Cuisine” appelle `notifyOrderInOrderBook(...)` après la création d’un ordre (succès API).  
4. ✅ La logique de suivi d’ordres appelle :  
   - `notifyOrderExecuted(...)` quand un ordre est exécuté,  
   - `notifyOrderClosedByWatcher(...)` quand un ordre est fermé par la surveillance.  
5. ✅ L’application compile, se lance, et les toasts apparaissent bien (par ex. en haut à droite).

---

## 8. Résumé ultra‑court pour Copilot

1. Installe `sonner`.  
2. Crée `src/components/ui/ToastProvider.tsx` et monte `<ToastProvider />` au niveau racine.  
3. Crée `src/hooks/useTradeNotifications.ts` avec les 3 helpers de notification.  
4. Sur la page “Cuisine” : appelle `notifyOrderInOrderBook()` après la création d’un ordre.  
5. Sur la logique de suivi des ordres : appelle `notifyOrderExecuted()` et `notifyOrderClosedByWatcher()` selon l’évolution des états.

Applique tout cela dans le repo COOKIE **sans casser le code existant**.
