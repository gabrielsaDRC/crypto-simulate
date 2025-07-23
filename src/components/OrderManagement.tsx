import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  X, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Clock,
  DollarSign,
  Target,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { binanceAPI } from '../services/api';
import { Order, NewOrderParams } from '../types/binance';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOGEUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'MATICUSDT'];

export function OrderManagement() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuantity, setEditQuantity] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  // Queries
  const { data: openOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['openOrders'],
    queryFn: () => binanceAPI.getAllOpenOrders(),
    refetchInterval: 3000,
    retry: 2,
  });

  const { data: account } = useQuery({
    queryKey: ['account'],
    queryFn: () => binanceAPI.getAccount(),
    refetchInterval: 5000,
  });

  const { data: ticker } = useQuery({
    queryKey: ['ticker', selectedSymbol],
    queryFn: () => binanceAPI.getTickerPrice(selectedSymbol),
    refetchInterval: 2000,
  });

  // Mutations
  const cancelOrderMutation = useMutation({
    mutationFn: ({ symbol, orderId }: { symbol: string; orderId: number }) => 
      binanceAPI.cancelOrder(symbol, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openOrders'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      setShowCancelConfirm(null);
    },
  });

  const cancelAllOrdersMutation = useMutation({
    mutationFn: (symbol: string) => binanceAPI.cancelAllOrders(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openOrders'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderParams: NewOrderParams) => binanceAPI.createOrder(orderParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openOrders'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      setShowEditModal(false);
      setSelectedOrder(null);
    },
  });

  // Helper functions
  const currentPrice = Array.isArray(ticker) ? 
    ticker.find(t => t.symbol === selectedSymbol)?.price : 
    ticker?.price;

  const handleCancelOrder = (orderId: number) => {
    cancelOrderMutation.mutate({ symbol: selectedSymbol, orderId });
  };

  const handleCancelAllOrders = () => {
    cancelAllOrdersMutation.mutate(selectedSymbol);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditQuantity(order.origQty);
    setEditPrice(order.price || '');
    setShowEditModal(true);
  };

  const handleUpdateOrder = () => {
    if (!selectedOrder || !editQuantity) return;

    // Cancel old order and create new one
    cancelOrderMutation.mutate(
      { symbol: selectedOrder.symbol, orderId: selectedOrder.orderId },
      {
        onSuccess: () => {
          const newOrderParams: NewOrderParams = {
            symbol: selectedOrder.symbol,
            side: selectedOrder.side as 'BUY' | 'SELL',
            type: selectedOrder.type as any,
            quantity: editQuantity,
            ...(selectedOrder.type === 'LIMIT' && { price: editPrice, timeInForce: 'GTC' }),
          };
          createOrderMutation.mutate(newOrderParams);
        }
      }
    );
  };

  const handleClosePosition = (order: Order) => {
    const oppositeOrderParams: NewOrderParams = {
      symbol: order.symbol,
      side: order.side === 'BUY' ? 'SELL' : 'BUY',
      type: 'MARKET',
      quantity: order.executedQty || order.origQty,
      reduceOnly: true,
    };
    createOrderMutation.mutate(oppositeOrderParams);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-900 text-blue-300';
      case 'PARTIALLY_FILLED': return 'bg-yellow-900 text-yellow-300';
      case 'FILLED': return 'bg-green-900 text-green-300';
      case 'CANCELED': return 'bg-red-900 text-red-300';
      case 'REJECTED': return 'bg-red-900 text-red-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Settings className="h-6 w-6 mr-2 text-yellow-500" />
              Order Management
            </h2>
            
            {currentPrice && (
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-yellow-500">
                  ${parseFloat(currentPrice).toFixed(4)}
                </div>
                <div className="text-gray-400">{selectedSymbol}</div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {SYMBOLS.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedSymbol === symbol
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  {symbol.replace('USDT', '/USDT')}
                </button>
              ))}
            </div>
            
            {openOrders && openOrders.length > 0 && (
              <button
                onClick={handleCancelAllOrders}
                disabled={cancelAllOrdersMutation.isPending}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Cancel All</span>
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-bold flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Open Orders - {selectedSymbol}
              {openOrders && (
                <span className="ml-2 bg-yellow-500 text-black px-2 py-1 rounded text-sm font-medium">
                  {openOrders.length}
                </span>
              )}
            </h3>
          </div>

          <div className="overflow-x-auto">
            {ordersLoading ? (
              <div className="p-8 text-center text-gray-400">
                <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                Loading orders...
              </div>
            ) : openOrders && openOrders.filter(order => order.symbol === selectedSymbol).length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Side</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Filled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {openOrders.filter(order => order.symbol === selectedSymbol).map((order) => {
                    const filledPercent = (parseFloat(order.executedQty) / parseFloat(order.origQty)) * 100;
                    const remainingQty = parseFloat(order.origQty) - parseFloat(order.executedQty);
                    
                    return (
                      <tr key={order.orderId} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {new Date(order.time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {order.side === 'BUY' ? (
                              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                            )}
                            <span className={`font-medium ${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                              {order.side}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
                            {order.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono">
                          <div>
                            <div className="text-white">{order.origQty}</div>
                            {remainingQty !== parseFloat(order.origQty) && (
                              <div className="text-xs text-gray-400">
                                Remaining: {remainingQty.toFixed(6)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono">
                          <div>
                            <div className="text-white">
                              ${parseFloat(order.price || order.avgPrice || '0').toFixed(4)}
                            </div>
                            {currentPrice && (
                              <div className="text-xs text-gray-400">
                                Market: ${parseFloat(currentPrice).toFixed(4)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${filledPercent > 0 ? 'bg-yellow-500' : 'bg-gray-600'}`}
                                style={{ width: `${Math.min(filledPercent, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-mono">{filledPercent.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getOrderStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {/* Edit Order */}
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              title="Edit Order"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            
                            {/* Close Position */}
                            {parseFloat(order.executedQty) > 0 && (
                              <button
                                onClick={() => handleClosePosition(order)}
                                className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                                title="Close Position"
                              >
                                <Target className="h-4 w-4" />
                              </button>
                            )}
                            
                            {/* Cancel Order */}
                            <button
                              onClick={() => setShowCancelConfirm(order.orderId)}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                              title="Cancel Order"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-lg mb-2">No open orders for {selectedSymbol}</p>
                <p className="text-sm">Your active orders will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Order Modal */}
        {showEditModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center">
                  <Edit3 className="h-5 w-5 mr-2 text-yellow-500" />
                  Edit Order
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symbol: {selectedOrder.symbol}
                  </label>
                  <div className={`text-lg font-medium ${selectedOrder.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedOrder.side} {selectedOrder.type}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    step="0.001"
                    min="0"
                  />
                </div>

                {selectedOrder.type === 'LIMIT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (USDT)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      step="0.0001"
                      min="0"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleUpdateOrder}
                    disabled={createOrderMutation.isPending || cancelOrderMutation.isPending}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    {createOrderMutation.isPending || cancelOrderMutation.isPending ? 'Updating...' : 'Update Order'}
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-lg font-bold">Cancel Order</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleCancelOrder(showCancelConfirm)}
                  disabled={cancelOrderMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {cancelOrderMutation.isPending ? 'Canceling...' : 'Yes, Cancel'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  No, Keep
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {cancelOrderMutation.isError && (
          <div className="fixed bottom-4 right-4 bg-red-900 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            Failed to cancel order. Please try again.
          </div>
        )}

        {cancelOrderMutation.isSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-900 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
            Order canceled successfully!
          </div>
        )}

        {createOrderMutation.isSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-900 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
            Order updated successfully!
          </div>
        )}
      </div>
    </div>
  );
}