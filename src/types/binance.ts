export interface ApiCredentials {
  apiKey: string;
  secretKey: string;
  testnet: boolean;
}

export interface Account {
  totalWalletBalance: string;
  totalUnrealizedProfit: string;
  totalMarginBalance: string;
  totalPositionInitialMargin: string;
  totalOpenOrderInitialMargin: string;
  maxWithdrawAmount: string;
  assets: Asset[];
  positions: Position[];
}

export interface Asset {
  asset: string;
  walletBalance: string;
  unrealizedProfit: string;
  marginBalance: string;
  maintMargin: string;
  initialMargin: string;
  positionInitialMargin: string;
  openOrderInitialMargin: string;
  maxWithdrawAmount: string;
}

export interface Position {
  symbol: string;
  initialMargin: string;
  maintMargin: string;
  unrealizedProfit: string;
  positionInitialMargin: string;
  openOrderInitialMargin: string;
  leverage: string;
  isolated: boolean;
  entryPrice: string;
  maxNotional: string;
  positionSide: string;
  positionAmt: string;
  notional: string;
  isolatedWallet: string;
  updateTime: number;
  bidNotional: string;
  askNotional: string;
}

export interface Order {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: string;
  avgPrice: string;
  origQty: string;
  executedQty: string;
  cumQty: string;
  cumQuote: string;
  timeInForce: string;
  type: string;
  reduceOnly: boolean;
  closePosition: boolean;
  side: string;
  positionSide: string;
  stopPrice: string;
  workingType: string;
  priceProtect: boolean;
  origType: string;
  time: number;
  updateTime: number;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface OrderBook {
  lastUpdateId: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface TickerPrice {
  symbol: string;
  price: string;
  time: number;
}

export interface NewOrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  positionSide?: 'BOTH' | 'LONG' | 'SHORT';
  type: 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET' | 'TAKE_PROFIT' | 'TAKE_PROFIT_MARKET';
  quantity: string;
  price?: string;
  stopPrice?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK' | 'GTX';
  reduceOnly?: boolean;
  newClientOrderId?: string;
  closePosition?: boolean;
  activationPrice?: string;
  callbackRate?: string;
  workingType?: 'MARK_PRICE' | 'CONTRACT_PRICE';
  priceProtect?: boolean;
}