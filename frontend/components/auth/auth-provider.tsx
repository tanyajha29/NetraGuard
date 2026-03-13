"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, clearToken, getToken, setToken } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";

export type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  register: (payload: { full_name: string; email: string; password: string; role?: string }, redirectTo?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<User>("/api/v1/auth/me")
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [pathname]);

  const login = async (email: string, password: string, redirectTo?: string) => {
    const res = await apiFetch<{ access_token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
      skipAuth: true,
    });
    setToken(res.access_token);
    const me = await apiFetch<User>("/api/v1/auth/me");
    setUser(me);
    router.replace(redirectTo || "/");
  };

  const register = async (payload: { full_name: string; email: string; password: string; role?: string }, redirectTo?: string) => {
    await apiFetch<User>("/api/v1/auth/register", {
      method: "POST",
      body: { ...payload, role: payload.role || "analyst" },
      skipAuth: true,
    });
    await login(payload.email, payload.password, redirectTo);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    router.push("/login");
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
}
