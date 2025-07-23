import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, BookOpen, Target, BarChart3, Settings, Zap, Shield } from 'lucide-react';
import { binanceAPI } from '../services/api';
import { NewOrderParams } from '../types/binance';
import { MarketStats } from './MarketStats';

const POPULAR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOGEUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'MATICUSDT'];

export function TradingInterface() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [positionSide, setPositionSide] = useState<'BOTH' | 'LONG' | 'SHORT'>('BOTH');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [marginType, setMarginType] = useState<'ISOLATED' | 'CROSSED'>('CROSSED');
  const [reduceOnly, setReduceOnly] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: ticker } = useQuery({
    queryKey: ['ticker', selectedSymbol],
    queryFn: () => binanceAPI.getTickerPrice(selectedSymbol),
    refetchInterval: 1000,
  });

  const { data: ticker24hr } = useQuery({
    queryKey: ['ticker24hr', selectedSymbol],
    queryFn: () => binanceAPI.get24hrTicker(selectedSymbol),
    refetchInterval: 5000,
  });

  const { data: orderBook } = useQuery({
    queryKey: ['orderBook', selectedSymbol],
    queryFn: () => binanceAPI.getOrderBook(selectedSymbol, 20),
    refetchInterval: 2000,
  });

  const { data: account } = useQuery({
    queryKey: ['account'],
    queryFn: () => binanceAPI.getAccount(),
    refetchInterval: 5000,
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderParams: NewOrderParams) => binanceAPI.createOrder(orderParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openOrders'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      queryClient.invalidateQueries({ queryKey: ['orderHistory'] });
      setQuantity('');
      setPrice('');
    },
  });

  const changeLeverageMutation = useMutation({
    mutationFn: ({ symbol, leverage }: { symbol: string; leverage: number }) => 
      binanceAPI.changeLeverage(symbol, leverage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] });
    },
  });

  const handlePlaceOrder = async () => {
    if (!quantity) return;

    const orderParams: NewOrderParams = {
      symbol: selectedSymbol,
      side,
      type: orderType,
      quantity,
      ...(positionSide !== 'BOTH' && { positionSide }),
      ...(orderType === 'LIMIT' && { price, timeInForce: 'GTC' }),
      ...(reduceOnly && { reduceOnly: true }),
    };

    createOrderMutation.mutate(orderParams);
  };

  const handleLeverageChange = (newLeverage: number) => {
    setLeverage(newLeverage);
    changeLeverageMutation.mutate({ symbol: selectedSymbol, leverage: newLeverage });
  };

  const currentPrice = Array.isArray(ticker) ? 
    ticker.find(t => t.symbol === selectedSymbol)?.price : 
    ticker?.price;

  const availableBalance = parseFloat(account?.maxWithdrawAmount || '0');
  const currentPosition = account?.positions?.find(pos => pos.symbol === selectedSymbol);
  const currentLeverage = currentPosition ? parseInt(currentPosition.leverage) : leverage;

  const calculateMaxQuantity = (percentage: number) => {
    if (!currentPrice || !availableBalance) return;
    const price = parseFloat(currentPrice);
    const maxValue = (availableBalance * leverage * percentage) / 100;
    const maxQty = maxValue / price;
    setQuantity(maxQty.toFixed(6));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Symbol Selection */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-yellow-500" />
              Futures Trading
            </h2>
            
            {currentPrice && (
              <div className="text-right">
                <div className="text-3xl font-bold font-mono text-yellow-500">
                  ${parseFloat(currentPrice).toFixed(4)}
                </div>
                <div className="text-gray-400">{selectedSymbol}</div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {POPULAR_SYMBOLS.map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  selectedSymbol === symbol
                    ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg transform scale-105'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                }`}
              >
                {symbol.replace('USDT', '/USDT')}
              </button>
            ))}
          </div>
        </div>

        {/* Market Statistics */}
        <MarketStats ticker={ticker24hr} symbol={selectedSymbol} />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Order Book */}
          <div className="xl:col-span-3">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-bold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Order Book - {selectedSymbol}
                </h3>
              </div>
              <div className="p-6">
                {orderBook ? (
                  <div className="grid grid-cols-2 gap-8">
                    {/* Asks (Sell Orders) */}
                    <div>
                      <h4 className="text-red-400 font-medium mb-4 text-center flex items-center justify-center">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Asks (Sell)
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Price (USDT)</span>
                          <span>Amount</span>
                        </div>
                        {orderBook.asks.slice(0, 15).reverse().map((ask, index) => (
                          <div key={index} className="flex justify-between text-sm font-mono hover:bg-red-900/20 p-1 rounded transition-colors cursor-pointer"
                               onClick={() => orderType === 'LIMIT' && setPrice(ask.price)}>
                            <span className="text-red-400">{parseFloat(ask.price).toFixed(4)}</span>
                            <span className="text-gray-300">{parseFloat(ask.quantity).toFixed(3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bids (Buy Orders) */}
                    <div>
                      <h4 className="text-green-400 font-medium mb-4 text-center flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Bids (Buy)
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Price (USDT)</span>
                          <span>Amount</span>
                        </div>
                        {orderBook.bids.slice(0, 15).map((bid, index) => (
                          <div key={index} className="flex justify-between text-sm font-mono hover:bg-green-900/20 p-1 rounded transition-colors cursor-pointer"
                               onClick={() => orderType === 'LIMIT' && setPrice(bid.price)}>
                            <span className="text-green-400">{parseFloat(bid.price).toFixed(4)}</span>
                            <span className="text-gray-300">{parseFloat(bid.quantity).toFixed(3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">Loading order book...</div>
                )}
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit sticky top-6">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <Target className="h-5 w-5 mr-2 text-yellow-500" />
              Futures Order
            </h3>

            <div className="space-y-6">
              {/* Leverage Settings */}
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    Leverage
                  </label>
                  <span className="text-yellow-500 font-bold">{currentLeverage}x</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[5, 10, 20, 25].map((lev) => (
                    <button
                      key={lev}
                      onClick={() => handleLeverageChange(lev)}
                      className={`py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${
                        currentLeverage === lev
                          ? 'bg-yellow-500 text-black shadow-lg'
                          : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="1"
                  max="125"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  onMouseUp={() => handleLeverageChange(leverage)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1x</span>
                  <span>125x</span>
                </div>
              </div>

              {/* Position Side */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Position Side</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BOTH', 'LONG', 'SHORT'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPositionSide(pos)}
                      className={`p-3 rounded-lg border transition-all duration-200 text-sm font-medium ${
                        positionSide === pos
                          ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Order Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType('MARKET')}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      orderType === 'MARKET'
                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => setOrderType('LIMIT')}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      orderType === 'LIMIT'
                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Price (for Limit orders) */}
              {orderType === 'LIMIT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (USDT)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono"
                    placeholder={currentPrice || "0.0000"}
                    step="0.0001"
                    min="0"
                  />
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono"
                  placeholder="0.001"
                  step="0.001"
                  min="0"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => calculateMaxQuantity(percent)}
                    className="py-2 px-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-sm transition-colors"
                  >
                    {percent}%
                  </button>
                ))}
              </div>

              {/* Reduce Only Option */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="reduceOnly"
                  checked={reduceOnly}
                  onChange={(e) => setReduceOnly(e.target.checked)}
                  className="h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                />
                <label htmlFor="reduceOnly" className="text-sm text-gray-300 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Reduce Only
                </label>
              </div>

              {/* Account Info */}
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available Balance:</span>
                    <span className="font-mono">${availableBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Buy Power:</span>
                    <span className="font-mono text-green-400">${(availableBalance * currentLeverage).toFixed(2)}</span>
                  </div>
                  {currentPosition && parseFloat(currentPosition.positionAmt) !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Position:</span>
                      <span className={`font-mono ${parseFloat(currentPosition.positionAmt) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(currentPosition.positionAmt) > 0 ? 'LONG' : 'SHORT'} {Math.abs(parseFloat(currentPosition.positionAmt))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Buy/Sell Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    setSide('BUY');
                    handlePlaceOrder();
                  }}
                  disabled={!quantity || (orderType === 'LIMIT' && !price) || createOrderMutation.isPending}
                  className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Buy / Long</span>
                </button>
                
                <button
                  onClick={() => {
                    setSide('SELL');
                    handlePlaceOrder();
                  }}
                  disabled={!quantity || (orderType === 'LIMIT' && !price) || createOrderMutation.isPending}
                  className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  <TrendingDown className="h-5 w-5" />
                  <span>Sell / Short</span>
                </button>
              </div>

              {/* Order Status Messages */}
              {createOrderMutation.isError && (
                <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm animate-pulse">
                  Failed to place order. Please try again.
                </div>
              )}

              {createOrderMutation.isSuccess && (
                <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm animate-pulse">
                  Order placed successfully!
                </div>
              )}

              {createOrderMutation.isPending && (
                <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-400 px-4 py-3 rounded-lg text-sm animate-pulse">
                  Placing order...
                </div>
              )}

              {changeLeverageMutation.isPending && (
                <div className="bg-blue-900/20 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg text-sm animate-pulse">
                  Updating leverage...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}