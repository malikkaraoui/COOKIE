import { useCallback } from "react";
import { toast } from "sonner";

type OrderSide = "buy" | "sell";

export interface TradeNotificationOrderInfo {
  id: string;
  symbol: string;
  side?: OrderSide;
  summaryText?: string;
  symbols?: string[];
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
    const symbolList = order.symbols?.length ? order.symbols.join(" + ") : order.symbol;
    toast.success(`✅ ${sideLabel.toUpperCase()} exécuté`, {
      description: order.summaryText ?? `C’est fait pour ${symbolList}.`,
      style: {
        backgroundColor: "#052711",
        color: "#dcfce7",
        border: "1px solid #22c55e",
        boxShadow: "0 16px 32px rgba(34,197,94,0.35)",
      },
    });
  }, []);

  const notifyOrderClosedByWatcher = useCallback((order: TradeNotificationOrderInfo) => {
    toast("🧠 Ordre fermé par la surveillance", {
      description: order.summaryText ?? `Plus d’activité sur ${order.symbol}.`,
      style: {
        backgroundColor: "#1e1b4b",
        color: "#e0e7ff",
        border: "1px solid #a78bfa",
      },
    });
  }, []);

  const notifyOrderInOrderBook = useCallback((order: TradeNotificationOrderInfo) => {
    const sideLabel = buildSideLabel(order.side);
    const tokens = order.symbols && order.symbols.length > 0
      ? order.symbols
      : order.symbol
        ? [order.symbol]
        : [];
    const readableList = tokens.length > 0 ? tokens.join(" + ") : "tes ordres";
    const title = tokens.length > 1
      ? `🧾 ${sideLabel} groupé en attente`
      : `🧾 ${sideLabel} ${tokens[0] ?? "spot"} en attente`;
    const description = order.summaryText
      ?? `Tu viens d'envoyer ${tokens.length > 1 ? `${tokens.length} achats : ${readableList}` : `un ${sideLabel} ${readableList}`}. On te prévient dès l’exécution.`;

    toast.info(title, {
      description,
      duration: 6000,
      style: {
        backgroundColor: "#031b2c",
        color: "#f0f9ff",
        border: "1px solid #0ea5e9",
        boxShadow: "0 18px 40px rgba(14,165,233,0.35)",
      },
    });
  }, []);

  return {
    notifyOrderExecuted,
    notifyOrderClosedByWatcher,
    notifyOrderInOrderBook,
  };
}
