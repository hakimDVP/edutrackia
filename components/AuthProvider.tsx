'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { listenAuth } from '@/lib/auth';
import type { User } from 'firebase/auth';

type AuthCtx = {
  user: User | null;
  loading: boolean;
};
const AuthContext = createContext<AuthCtx>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = listenAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}