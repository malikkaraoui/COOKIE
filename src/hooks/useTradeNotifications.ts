import { useCallback } from "react";
import { toast } from "sonner";

type OrderSide = "buy" | "sell";

export interface TradeNotificationOrderInfo {
  id: string;
  symbol: string;
  side?: OrderSide;
}

function buildSideLabel(side?: OrderSide) {
  if (side === "buy") {
    return "achat";
  }
  if (side === "sell") {
    return "vente";
  }
  return "ordre";
}

export function useTradeNotifications() {
  const notifyOrderExecuted = useCallback((order: TradeNotificationOrderInfo) => {
    const sideLabel = buildSideLabel(order.side);
    toast.success(`✅ ${sideLabel.toUpperCase()} exécuté sur ${order.symbol}`, {
      description: `ID ordre : ${order.id}`,
    });
  }, []);

  const notifyOrderClosedByWatcher = useCallback((order: TradeNotificationOrderInfo) => {
    toast("🧠 Ordre fermé par la surveillance", {
      description: `ID : ${order.id} – ${order.symbol}`,
    });
  }, []);

  const notifyOrderInOrderBook = useCallback((order: TradeNotificationOrderInfo) => {
    const sideLabel = buildSideLabel(order.side);
    toast.info(`⏳ ${sideLabel} en attente dans le carnet`, {
      description: `ID : ${order.id} – ${order.symbol}`,
    });
  }, []);

  return {
    notifyOrderExecuted,
    notifyOrderClosedByWatcher,
    notifyOrderInOrderBook,
  };
}
