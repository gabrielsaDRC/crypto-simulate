import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, LogOut } from 'lucide-react';
import { binanceAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { logout, credentials } = useAuth();

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['account'],
    queryFn: () => binanceAPI.getAccount(),
    refetchInterval: 5000,
  });

  const { data: openOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['openOrders'],
    queryFn: () => binanceAPI.getAllOpenOrders(),
    refetchInterval: 5000,
    enabled: !!account,
    retry: 2,
  });

  if (accountLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading account data...</div>
      </div>
    );
  }

  const totalBalance = parseFloat(account?.totalWalletBalance || '0');
  const unrealizedPnL = parseFloat(account?.totalUnrealizedProfit || '0');
  const availableBalance = parseFloat(account?.maxWithdrawAmount || '0');

  const activePositions = account?.positions?.filter(pos => parseFloat(pos.positionAmt) !== 0) || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold">Binance Futures</h1>
            {credentials?.testnet && (
              <span className="bg-orange-500 text-black px-2 py-1 rounded text-sm font-medium">
                TESTNET
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Balance</p>
                <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available Balance</p>
                <p className="text-2xl font-bold">${availableBalance.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unrealized PnL</p>
                <p className={`text-2xl font-bold ${unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${unrealizedPnL.toFixed(2)}
                </p>
              </div>
              {unrealizedPnL >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Open Positions</p>
                <p className="text-2xl font-bold">{activePositions.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Active Positions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold">Active Positions</h2>
          </div>
          <div className="overflow-x-auto">
            {activePositions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entry Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Leverage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stop Loss</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Take Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {activePositions.map((position, index) => {
                    const pnl = parseFloat(position.unrealizedProfit);
                    const size = parseFloat(position.positionAmt);
                    const entryPrice = parseFloat(position.entryPrice);
                    
                    // Mock stop loss and take profit for demonstration
                    // In real implementation, these would come from actual orders or position data
                    const stopLoss = size > 0 ? entryPrice * 0.95 : entryPrice * 1.05; // 5% stop loss
                    const takeProfit = size > 0 ? entryPrice * 1.10 : entryPrice * 0.90; // 10% take profit
                    
                    return (
                      <tr key={index} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{position.symbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`${size > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {size > 0 ? 'LONG' : 'SHORT'} {Math.abs(size)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono">
                          ${entryPrice.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{position.leverage}x</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-red-400">
                            ${stopLoss.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-green-400">
                            ${takeProfit.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-mono ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${pnl.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400">
                No active positions
              </div>
            )}
          </div>
        </div>

        {/* Open Orders */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold">Open Orders</h2>
          </div>
          <div className="overflow-x-auto">
            {ordersLoading ? (
              <div className="p-8 text-center text-gray-400">
                Loading orders...
              </div>
            ) : openOrders && openOrders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Side</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {openOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{order.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                          {order.side}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">{order.origQty}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">${parseFloat(order.price).toFixed(4)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-900 text-yellow-300">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400">
                No open orders
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}