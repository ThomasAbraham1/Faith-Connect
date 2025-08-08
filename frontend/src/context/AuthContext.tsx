import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  loginToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loginToken, setLoginToken] = useState<string | null>(null);
 
  const login = (token: string) => {
    setLoginToken(token);
  };

  const logout = () => {
    setLoginToken(null); 
  };

  const isAuthenticated = () => !!loginToken;

  return (
    <AuthContext.Provider value={{ loginToken, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}