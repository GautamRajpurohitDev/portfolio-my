"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { authApi } from "../lib/api";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Track whether we've done the initial auth check.
  // This prevents re-running checkAuth on every client-side navigation.
  const hasCheckedAuth = useRef(false);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const res = await authApi.me();
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        return true;
      }
      setUser(null);
      return false;
    } catch {
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Run checkAuth ONCE on mount (not on every pathname change).
  // We only do it when on an admin route to avoid hitting the API on public pages.
  useEffect(() => {
    if (hasCheckedAuth.current) return;

    if (pathname?.startsWith("/admin")) {
      hasCheckedAuth.current = true;
      checkAuth();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After login navigates away from /admin/login, we already have the user
  // in state, so no re-check is needed.

  const login = (userData: User) => {
    setUser(userData);
    // Use replace to avoid a back-button loop to /admin/login
    router.replace("/admin");
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      hasCheckedAuth.current = false; // allow re-check on next admin visit
      router.replace("/admin/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
