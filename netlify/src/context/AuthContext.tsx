"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, mockUsers, Role } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for session
    const storedUser = localStorage.getItem('hospital_demo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: Role) => {
    const matchedUser = mockUsers.find(u => u.email === email && u.role === role);
    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem('hospital_demo_user', JSON.stringify(matchedUser));
      
      // Redirect based on role
      switch (role) {
        case 'patient':
          router.push('/patient/dashboard');
          break;
        case 'doctor':
          router.push('/doctor/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
      }
    } else {
      alert('Invalid login credentials for ' + role + '. You can use patient@example.com, doctor@example.com or admin@example.com');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hospital_demo_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
