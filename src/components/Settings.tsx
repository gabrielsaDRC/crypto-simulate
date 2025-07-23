import React from 'react';
import { Settings as SettingsIcon, Shield, TestTube, Key, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { credentials, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold flex items-center">
              <SettingsIcon className="h-6 w-6 mr-2" />
              Settings
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* API Configuration */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                API Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                  <div className="bg-gray-800 p-3 rounded border border-gray-600 font-mono text-sm">
                    {credentials?.apiKey ? 
                      `${credentials.apiKey.substring(0, 8)}${'*'.repeat(credentials.apiKey.length - 8)}` :
                      'Not configured'
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Environment</label>
                  <div className="flex items-center space-x-2">
                    {credentials?.testnet ? (
                      <>
                        <TestTube className="h-5 w-5 text-orange-500" />
                        <span className="bg-orange-500 text-black px-2 py-1 rounded text-sm font-medium">
                          TESTNET
                        </span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 text-red-500" />
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                          PRODUCTION
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-900/20 border border-yellow-500 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">Security Notice</h3>
              <ul className="text-sm text-yellow-300 space-y-2">
                <li>• Your API keys are transmitted securely and never stored in the browser</li>
                <li>• Always use API keys with restricted permissions (Futures trading only)</li>
                <li>• Never share your secret key with anyone</li>
                <li>• Consider using IP restrictions on your Binance API keys</li>
                <li>• Monitor your account activity regularly</li>
              </ul>
            </div>

            {/* Logout */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Session Management</h3>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
              <p className="text-sm text-gray-400 mt-2">
                This will disconnect your API session and return you to the login screen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}