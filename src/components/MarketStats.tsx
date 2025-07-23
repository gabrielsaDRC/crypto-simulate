import React from 'react';
import { TrendingUp, TrendingDown, Activity, Volume2 } from 'lucide-react';

interface MarketStatsProps {
  ticker: any;
  symbol: string;
}

export function MarketStats({ ticker, symbol }: MarketStatsProps) {
  if (!ticker) return null;

  const priceChange = parseFloat(ticker.priceChange || '0');
  const priceChangePercent = parseFloat(ticker.priceChangePercent || '0');
  const volume = parseFloat(ticker.volume || '0');
  const quoteVolume = parseFloat(ticker.quoteVolume || '0');
  const high = parseFloat(ticker.highPrice || '0');
  const low = parseFloat(ticker.lowPrice || '0');

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2" />
        24h Statistics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">24h Change</span>
            {priceChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {priceChangePercent.toFixed(2)}%
          </div>
          <div className={`text-sm font-mono ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${priceChange.toFixed(4)}
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">24h High</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            ${high.toFixed(4)}
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">24h Low</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            ${low.toFixed(4)}
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">24h Volume</span>
            <Volume2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-white">
            {(volume / 1000000).toFixed(2)}M
          </div>
          <div className="text-sm text-gray-400">
            ${(quoteVolume / 1000000).toFixed(2)}M USDT
          </div>
        </div>
      </div>
    </div>
  );
}