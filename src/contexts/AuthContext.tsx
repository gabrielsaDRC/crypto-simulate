import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ApiCredentials } from '../types/binance';
import { binanceAPI } from '../services/api';

interface AuthContextType {
  credentials: ApiCredentials | null;
  isAuthenticated: boolean;
  login: (credentials: ApiCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<ApiCredentials | null>(null);

  const login = async (creds: ApiCredentials): Promise<boolean> => {
    try {
      binanceAPI.setCredentials(creds);
      const success = await binanceAPI.testConnection();
      
      if (success) {
        setCredentials(creds);
        return true;
      } else {
        binanceAPI.setCredentials({} as ApiCredentials);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setCredentials(null);
    binanceAPI.setCredentials({} as ApiCredentials);
  };

  return (
    <AuthContext.Provider
      value={{
        credentials,
        isAuthenticated: !!credentials,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}