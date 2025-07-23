import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Filter } from 'lucide-react';
import { binanceAPI } from '../services/api';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOGEUSDT', 'SOLUSDT'];

export function OrderHistory() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orderHistory', selectedSymbol],
    queryFn: () => binanceAPI.getAllOrders(selectedSymbol, 100),
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <Clock className="h-6 w-6 mr-2" />
                Order History
              </h2>
              
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {SYMBOLS.map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">
                Loading order history...
              </div>
            ) : orders && orders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Side</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Filled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {new Date(order.time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{order.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                          {order.side}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">{order.origQty}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">
                        ${parseFloat(order.price || order.avgPrice || '0').toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">
                        {((parseFloat(order.executedQty) / parseFloat(order.origQty)) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'FILLED' ? 'bg-green-900 text-green-300' :
                          order.status === 'CANCELED' ? 'bg-red-900 text-red-300' :
                          order.status === 'PARTIALLY_FILLED' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-gray-900 text-gray-300'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400">
                No orders found for {selectedSymbol}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}