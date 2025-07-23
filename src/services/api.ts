import axios from 'axios';
import crypto from 'crypto-js';
import { ApiCredentials, Account, Order, OrderBook, TickerPrice, NewOrderParams } from '../types/binance';

const BINANCE_FUTURES_API = 'https://fapi.binance.com';
const BINANCE_TESTNET_API = 'https://testnet.binancefuture.com';

// Mock data for testing/presentation purposes
const MOCK_OPEN_ORDERS: Order[] = [
  {
    orderId: 5445376859,
    symbol: "BTCUSDT",
    status: "NEW",
    clientOrderId: "web_hLyjwZCG9cimvYD2PlUw",
    price: "112951.20",
    avgPrice: "0",
    origQty: "0.060",
    executedQty: "0",
    cumQuote: "0.00000",
    timeInForce: "GTC",
    type: "LIMIT",
    reduceOnly: false,
    closePosition: false,
    side: "BUY",
    positionSide: "BOTH",
    stopPrice: "0",
    workingType: "CONTRACT_PRICE",
    priceProtect: false,
    origType: "LIMIT",
    priceMatch: "NONE",
    selfTradePreventionMode: "EXPIRE_MAKER",
    goodTillDate: 0,
    time: 1753241585576,
    updateTime: 1753241585576
  },
  {
    orderId: 5445376860,
    symbol: "ETHUSDT",
    status: "NEW",
    clientOrderId: "web_kMzxwZCG9cimvYD2PlVx",
    price: "3850.50",
    avgPrice: "0",
    origQty: "1.250",
    executedQty: "0",
    cumQuote: "0.00000",
    timeInForce: "GTC",
    type: "LIMIT",
    reduceOnly: false,
    closePosition: false,
    side: "SELL",
    positionSide: "BOTH",
    stopPrice: "0",
    workingType: "CONTRACT_PRICE",
    priceProtect: false,
    origType: "LIMIT",
    priceMatch: "NONE",
    selfTradePreventionMode: "EXPIRE_MAKER",
    goodTillDate: 0,
    time: 1753241585577,
    updateTime: 1753241585577
  },
  {
    orderId: 5445376861,
    symbol: "ADAUSDT",
    status: "PARTIALLY_FILLED",
    clientOrderId: "web_nOzywZCG9cimvYD2PlWy",
    price: "1.2500",
    avgPrice: "1.2485",
    origQty: "500.000",
    executedQty: "150.000",
    cumQuote: "187.27500",
    timeInForce: "GTC",
    type: "LIMIT",
    reduceOnly: false,
    closePosition: false,
    side: "BUY",
    positionSide: "BOTH",
    stopPrice: "0",
    workingType: "CONTRACT_PRICE",
    priceProtect: false,
    origType: "LIMIT",
    priceMatch: "NONE",
    selfTradePreventionMode: "EXPIRE_MAKER",
    goodTillDate: 0,
    time: 1753241585578,
    updateTime: 1753241585580
  }
];

class BinanceAPI {
  private credentials: ApiCredentials | null = null;

  setCredentials(credentials: ApiCredentials) {
    this.credentials = credentials;
  }

  getCredentials(): ApiCredentials | null {
    return this.credentials;
  }

  private getApiBaseUrl(): string {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }
    return this.credentials.testnet ? BINANCE_TESTNET_API : BINANCE_FUTURES_API;
  }

  private createSignature(queryString: string): string {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }
    return crypto.HmacSHA256(queryString, this.credentials.secretKey).toString();
  }

  private getAuthHeaders() {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }
    
    return {
      'X-MBX-APIKEY': this.credentials.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async makeAuthenticatedRequest(method: string, endpoint: string, params: any = {}) {
    const baseURL = this.getApiBaseUrl();
    const timestamp = Date.now();
    
    const allParams = { ...params, timestamp };
    const queryString = new URLSearchParams(allParams).toString();
    const signature = this.createSignature(queryString);
    
    const finalQueryString = `${queryString}&signature=${signature}`;
    
    const config: any = {
      method,
      url: `${baseURL}${endpoint}?${finalQueryString}`,
      headers: this.getAuthHeaders(),
    };

    return axios(config);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest('GET', '/fapi/v2/account');
      return response.status === 200;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getAccount(): Promise<Account> {
    const response = await this.makeAuthenticatedRequest('GET', '/fapi/v2/account');
    return response.data;
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    try {
      // Return mock data for testing/presentation purposes
      // TODO: Replace with actual API call once backend proxy is implemented
      console.log('Using mock open orders data for testing');
      
      if (symbol) {
        return MOCK_OPEN_ORDERS.filter(order => order.symbol === symbol);
      }
      return MOCK_OPEN_ORDERS;
    } catch (error) {
      console.error('Error fetching open orders:', error);
      // Return mock data even on error for testing purposes
      console.log('Returning mock data due to API error');
      if (symbol) {
        return MOCK_OPEN_ORDERS.filter(order => order.symbol === symbol);
      }
      return MOCK_OPEN_ORDERS;
    }
  }

  async getAllOpenOrders(): Promise<Order[]> {
    try {
      // Return mock data for testing/presentation purposes
      // TODO: Replace with actual API call once backend proxy is implemented
      console.log('Using mock open orders data for testing');
      return MOCK_OPEN_ORDERS;
    } catch (error) {
      console.error('Error fetching all open orders:', error);
      // Return mock data even on error for testing purposes
      console.log('Returning mock data due to API error');
      return MOCK_OPEN_ORDERS;
    }
  }

  async getAllOrders(symbol: string, limit: number = 50): Promise<Order[]> {
    const response = await this.makeAuthenticatedRequest('GET', '/fapi/v1/allOrders', { symbol, limit });
    return response.data;
  }

  async getOrderBook(symbol: string, limit: number = 20): Promise<OrderBook> {
    const baseURL = this.getApiBaseUrl();
    const response = await axios.get(`${baseURL}/fapi/v1/depth`, {
      params: { symbol, limit },
    });
    return response.data;
  }

  async getTickerPrice(symbol?: string): Promise<TickerPrice | TickerPrice[]> {
    const params = symbol ? { symbol } : {};
    const baseURL = this.getApiBaseUrl();
    const response = await axios.get(`${baseURL}/fapi/v1/ticker/price`, {
      params,
    });
    return response.data;
  }

  async getKlines(symbol: string, interval: string = '1m', limit: number = 100): Promise<any[]> {
    const baseURL = this.getApiBaseUrl();
    const response = await axios.get(`${baseURL}/fapi/v1/klines`, {
      params: { symbol, interval, limit },
    });
    return response.data;
  }

  async get24hrTicker(symbol: string): Promise<any> {
    const baseURL = this.getApiBaseUrl();
    const response = await axios.get(`${baseURL}/fapi/v1/ticker/24hr`, {
      params: { symbol },
    });
    return response.data;
  }

  async createOrder(orderParams: NewOrderParams): Promise<Order> {
    const response = await this.makeAuthenticatedRequest('POST', '/fapi/v1/order', orderParams);
    return response.data;
  }

  async cancelOrder(symbol: string, orderId: number): Promise<Order> {
    const response = await this.makeAuthenticatedRequest('DELETE', '/fapi/v1/order', { symbol, orderId });
    return response.data;
  }

  async cancelAllOrders(symbol: string): Promise<{ code: number; msg: string }> {
    const response = await this.makeAuthenticatedRequest('DELETE', '/fapi/v1/allOpenOrders', { symbol });
    return response.data;
  }

  async changePositionMode(dualSidePosition: boolean): Promise<{ code: number; msg: string }> {
    const response = await this.makeAuthenticatedRequest('POST', '/fapi/v1/positionSide/dual', { dualSidePosition });
    return response.data;
  }

  async changeLeverage(symbol: string, leverage: number): Promise<{ leverage: number; maxNotionalValue: string; symbol: string }> {
    const response = await this.makeAuthenticatedRequest('POST', '/fapi/v1/leverage', { symbol, leverage });
    return response.data;
  }

  async changeMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSSED'): Promise<{ code: number; msg: string }> {
    const response = await this.makeAuthenticatedRequest('POST', '/fapi/v1/marginType', { symbol, marginType });
    return response.data;
  }

  async getPositionMode(): Promise<{ dualSidePosition: boolean }> {
    const response = await this.makeAuthenticatedRequest('GET', '/fapi/v1/positionSide/dual');
    return response.data;
  }
}

export const binanceAPI = new BinanceAPI();