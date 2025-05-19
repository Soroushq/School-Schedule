'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import useAuth from '@/hooks/useAuth';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: any;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  user: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  loginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);
  
  const value = {
    ...auth,
    loginModalOpen,
    openLoginModal,
    closeLoginModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 