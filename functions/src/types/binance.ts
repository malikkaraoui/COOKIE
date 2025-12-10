export type BinanceOrderSide = "BUY" | "SELL";
export type BinanceOrderType = "LIMIT" | "MARKET";
export type BinanceTimeInForce = "GTC" | "IOC" | "FOK";

export interface CreateSpotOrderInput {
  symbol: string;
  side: BinanceOrderSide;
  type: BinanceOrderType;
  quantity?: string;
  quoteOrderQty?: string;
  price?: string;
  timeInForce?: BinanceTimeInForce;
  newClientOrderId?: string;
  reduceOnly?: boolean;
}

export interface BinanceOpenOrder {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cumulativeQuoteQty: string;
  status:
    | "NEW"
    | "PARTIALLY_FILLED"
    | "FILLED"
    | "CANCELED"
    | "PENDING_CANCEL"
    | "REJECTED"
    | "EXPIRED";
  timeInForce: BinanceTimeInForce;
  type: BinanceOrderType | string;
  side: BinanceOrderSide;
  stopPrice: string;
  icebergQty: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  origQuoteOrderQty: string;
}

export interface BinanceAccountBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface BinanceAccountInformation {
  makerCommission?: number;
  takerCommission?: number;
  buyerCommission?: number;
  sellerCommission?: number;
  canTrade?: boolean;
  canWithdraw?: boolean;
  canDeposit?: boolean;
  updateTime?: number;
  accountType?: string;
  balances: BinanceAccountBalance[];
  permissions?: string[];
}

export interface BinanceTickerPrice {
  symbol: string;
  price: string;
}

export type BinanceExchangeFilterType =
  | "PRICE_FILTER"
  | "LOT_SIZE"
  | "MIN_NOTIONAL"
  | "NOTIONAL"
  | "MARKET_LOT_SIZE"
  | "ICEBERG_PARTS"
  | "MAX_NUM_ORDERS"
  | "MAX_NUM_ALGO_ORDERS"
  | "PERCENT_PRICE"
  | "PERCENT_PRICE_BY_SIDE"
  | "TRAILING_DELTA";

export interface BinanceExchangeFilterBase {
  filterType: BinanceExchangeFilterType;
  [key: string]: string | number | boolean | undefined;
}

export interface BinanceExchangeSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  filters: BinanceExchangeFilterBase[];
  orderTypes?: string[];
  icebergAllowed?: boolean;
}

export interface BinanceExchangeInfo {
  timezone: string;
  serverTime: number;
  symbols: BinanceExchangeSymbol[];
}

export interface BinanceDustTransferResult {
  amount: string;
  fromAsset: string;
  serviceChargeAmount: string;
  transferedAmount: string;
  operateTime: number;
}

export interface BinanceDustConversionResponse {
  totalServiceCharge?: string;
  totalTransfered?: string;
  transferResult?: BinanceDustTransferResult[];
}
