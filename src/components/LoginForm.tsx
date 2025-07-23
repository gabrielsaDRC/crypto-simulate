import React, { useState } from 'react';
import { Eye, EyeOff, Key, Shield, TestTube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiCredentials } from '../types/binance';

export function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<ApiCredentials>({
    apiKey: '',
    secretKey: '',
    testnet: true,
  });
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData);
      if (!success) {
        setError('Failed to connect to Binance API. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Binance Futures Trading</h1>
          <p className="text-gray-400">Connect with your API credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Key className="inline h-4 w-4 mr-2" />
              API Key
            </label>
            <input
              type="text"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter your Binance API Key"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Shield className="inline h-4 w-4 mr-2" />
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={formData.secretKey}
                onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter your Binance Secret Key"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="testnet"
              checked={formData.testnet}
              onChange={(e) => setFormData(prev => ({ ...prev, testnet: e.target.checked }))}
              className="h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="testnet" className="ml-2 text-sm text-gray-300 flex items-center">
              <TestTube className="h-4 w-4 mr-1" />
              Use Testnet Environment
            </label>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect to Binance'}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Your API keys are securely transmitted and never stored in the browser.</p>
          <p className="mt-1">Always use API keys with only Futures trading permissions.</p>
        </div>
      </div>
    </div>
  );
}